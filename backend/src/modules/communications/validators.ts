import {
  CreateConversationInput,
  CreateConversationAttachmentInput,
  ListConversationsFilters,
  MarkMessagesReadInput,
  SendMessageInput
} from './dto';
import {
  CommunicationAttachmentType,
  CommunicationCategory,
  CommunicationPriority,
  CommunicationStatus,
  CommunicationVisibility
} from './types';

const categories: CommunicationCategory[] = [
  'INCIDENCE',
  'PAYMENT',
  'CONTRACT',
  'MAINTENANCE',
  'DOCUMENTATION',
  'GENERAL_NOTICE',
  'QUESTION',
  'URGENT'
];
const priorities: CommunicationPriority[] = ['low', 'normal', 'high', 'urgent'];
const statuses: CommunicationStatus[] = ['OPEN', 'CLOSED'];
const visibilities: CommunicationVisibility[] = ['EXTERNAL', 'INTERNAL'];
const attachmentTypes: CommunicationAttachmentType[] = ['FILE', 'LINK', 'DOCUMENT'];

function normalizeString(value: unknown, field: string, errors: string[], options: { max?: number; required?: boolean } = {}) {
  const { max = 4000, required = true } = options;
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    if (required) {
      errors.push(`${field} es obligatorio`);
    }
    return '';
  }
  if (normalized.length > max) {
    errors.push(`${field} supera el límite de ${max} caracteres`);
  }
  return normalized;
}

function normalizeUrl(value: unknown, field: string, errors: string[]) {
  const normalized = normalizeString(value, field, errors, { max: 2000 });
  if (!normalized) return '';
  try {
    const url = new URL(normalized);
    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push(`${field} debe usar http o https`);
    }
    return url.toString();
  } catch {
    errors.push(`${field} no es una URL válida`);
    return '';
  }
}

function normalizeAttachment(input: any, index: number, errors: string[]): CreateConversationAttachmentInput {
  const type = String(input?.type ?? '').trim().toUpperCase() as CommunicationAttachmentType;
  if (!attachmentTypes.includes(type)) {
    errors.push(`attachments[${index}].type inválido`);
  }
  const sizeBytes =
    input?.sizeBytes === undefined || input?.sizeBytes === null
      ? null
      : Number.isFinite(Number(input.sizeBytes))
        ? Number(input.sizeBytes)
        : NaN;
  if (Number.isNaN(sizeBytes)) {
    errors.push(`attachments[${index}].sizeBytes inválido`);
  }
  return {
    type,
    name: normalizeString(input?.name, `attachments[${index}].name`, errors, { max: 255 }),
    url: normalizeUrl(input?.url, `attachments[${index}].url`, errors),
    mimeType: input?.mimeType ? normalizeString(input.mimeType, `attachments[${index}].mimeType`, errors, { max: 255 }) : null,
    storagePath: input?.storagePath
      ? normalizeString(input.storagePath, `attachments[${index}].storagePath`, errors, { max: 500 })
      : null,
    sizeBytes: sizeBytes ?? null,
    checksum: input?.checksum ? normalizeString(input.checksum, `attachments[${index}].checksum`, errors, { max: 255 }) : null
  };
}

export function sanitizePlainText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function validateCreateConversation(body: any): { value?: CreateConversationInput; errors: string[] } {
  const errors: string[] = [];
  const scopeType = String(body?.scopeType ?? '').trim().toUpperCase();
  const category = String(body?.category ?? '').trim().toUpperCase() as CommunicationCategory;
  const priority = String(body?.priority ?? '').trim().toLowerCase() as CommunicationPriority;
  const visibility = body?.visibility ? String(body.visibility).trim().toUpperCase() as CommunicationVisibility : 'EXTERNAL';
  const attachments = Array.isArray(body?.attachments)
    ? body.attachments.map((attachment: unknown, index: number) => normalizeAttachment(attachment, index, errors))
    : [];

  if (!['GENERAL', 'PROPERTY', 'LEASE'].includes(scopeType)) {
    errors.push('scopeType inválido');
  }
  if (!categories.includes(category)) {
    errors.push('category inválida');
  }
  if (!priorities.includes(priority)) {
    errors.push('priority inválida');
  }
  if (!visibilities.includes(visibility)) {
    errors.push('visibility inválida');
  }

  const subject = normalizeString(body?.subject, 'subject', errors, { max: 200 });
  const tenantPersonId = normalizeString(body?.tenantPersonId, 'tenantPersonId', errors, { max: 100 });
  const unitId = body?.unitId ? normalizeString(body.unitId, 'unitId', errors, { max: 100 }) : null;
  const leaseId = body?.leaseId ? normalizeString(body.leaseId, 'leaseId', errors, { max: 100 }) : null;
  const initialMessage = sanitizePlainText(normalizeString(body?.initialMessage, 'initialMessage', errors, { max: 5000 }));

  if (scopeType !== 'GENERAL' && !unitId) {
    errors.push('unitId es obligatorio para conversaciones PROPERTY o LEASE');
  }
  if (scopeType === 'LEASE' && !leaseId) {
    errors.push('leaseId es obligatorio para conversaciones LEASE');
  }

  if (errors.length) {
    return { errors };
  }

  return {
    errors,
    value: {
      subject,
      tenantPersonId,
      unitId,
      leaseId,
      scopeType: scopeType as CreateConversationInput['scopeType'],
      category,
      priority,
      initialMessage,
      visibility,
      attachments
    }
  };
}

export function validateListConversationFilters(query: any): { value: ListConversationsFilters; errors: string[] } {
  const errors: string[] = [];
  const status = query?.status ? String(query.status).trim().toUpperCase() as CommunicationStatus : undefined;
  const category = query?.category ? String(query.category).trim().toUpperCase() as CommunicationCategory : undefined;
  const priority = query?.priority ? String(query.priority).trim().toLowerCase() as CommunicationPriority : undefined;

  if (status && !statuses.includes(status)) {
    errors.push('status inválido');
  }
  if (category && !categories.includes(category)) {
    errors.push('category inválida');
  }
  if (priority && !priorities.includes(priority)) {
    errors.push('priority inválida');
  }

  const limit = query?.limit ? Number(query.limit) : 25;
  const offset = query?.offset ? Number(query.offset) : 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    errors.push('limit debe estar entre 1 y 100');
  }
  if (!Number.isInteger(offset) || offset < 0) {
    errors.push('offset inválido');
  }

  return {
    errors,
    value: {
      unitId: query?.unitId ? String(query.unitId).trim() : undefined,
      leaseId: query?.leaseId ? String(query.leaseId).trim() : undefined,
      status,
      category,
      priority,
      unreadOnly: String(query?.unreadOnly ?? '').trim().toLowerCase() === 'true',
      limit,
      offset
    }
  };
}

export function validateSendMessage(body: any): { value?: SendMessageInput; errors: string[] } {
  const errors: string[] = [];
  const visibility = body?.visibility ? String(body.visibility).trim().toUpperCase() as CommunicationVisibility : 'EXTERNAL';
  const category = body?.category ? String(body.category).trim().toUpperCase() as CommunicationCategory : null;
  const priority = body?.priority ? String(body.priority).trim().toLowerCase() as CommunicationPriority : null;
  const attachments = Array.isArray(body?.attachments)
    ? body.attachments.map((attachment: unknown, index: number) => normalizeAttachment(attachment, index, errors))
    : [];

  if (!visibilities.includes(visibility)) {
    errors.push('visibility inválida');
  }
  if (category && !categories.includes(category)) {
    errors.push('category inválida');
  }
  if (priority && !priorities.includes(priority)) {
    errors.push('priority inválida');
  }

  const bodyText = sanitizePlainText(normalizeString(body?.body, 'body', errors, { max: 5000 }));

  if (errors.length) {
    return { errors };
  }

  return {
    errors,
    value: {
      body: bodyText,
      visibility,
      category,
      priority,
      attachments
    }
  };
}

export function validateMarkRead(body: any): { value?: MarkMessagesReadInput; errors: string[] } {
  const errors: string[] = [];
  const conversationId = body?.conversationId ? String(body.conversationId).trim() : undefined;
  const messageIds = Array.isArray(body?.messageIds)
    ? body.messageIds.map((value: unknown) => String(value ?? '').trim()).filter(Boolean)
    : undefined;

  if (!conversationId && (!messageIds || !messageIds.length)) {
    errors.push('Se requiere conversationId o messageIds');
  }

  return {
    errors,
    value: errors.length ? undefined : { conversationId, messageIds }
  };
}
