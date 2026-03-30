import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  addAttachmentLink,
  closeConversation,
  createConversation,
  getConversationDetail,
  getOpenConversationCount,
  listConversations,
  listUnreadMessages,
  markMessagesRead,
  reopenConversation,
  sendMessage
} from './service';
import {
  sanitizePlainText,
  validateCreateConversation,
  validateListConversationFilters,
  validateMarkRead,
  validateSendMessage
} from './validators';
import { openCommunicationsStream } from './realtime';

function resolveActor(req: AuthenticatedRequest) {
  const actor = req.authActor;
  if (!actor) {
    const error = new Error('Autenticación requerida');
    (error as any).status = 401;
    throw error;
  }
  return actor;
}

function handleError(res: Response, error: unknown, fallbackMessage: string) {
  console.error(error);
  const status = (error as any)?.status ?? 500;
  const message = String((error as any)?.message ?? fallbackMessage);
  res.status(status).json({ message });
}

export async function createConversationHandler(req: AuthenticatedRequest, res: Response) {
  const validation = validateCreateConversation(req.body);
  if (validation.errors.length || !validation.value) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const actor = resolveActor(req);
    const result = await createConversation(actor.ownerId, actor, validation.value);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo crear la conversación');
  }
}

export async function listConversationsHandler(req: AuthenticatedRequest, res: Response) {
  const validation = validateListConversationFilters(req.query);
  if (validation.errors.length) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const actor = resolveActor(req);
    const result = await listConversations(actor.ownerId, actor, validation.value);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudieron cargar las conversaciones');
  }
}

export async function getConversationDetailHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const actor = resolveActor(req);
    const result = await getConversationDetail(actor.ownerId, actor, req.params.conversationId);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo cargar la conversación');
  }
}

export async function sendMessageHandler(req: AuthenticatedRequest, res: Response) {
  const validation = validateSendMessage(req.body);
  if (validation.errors.length || !validation.value) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const actor = resolveActor(req);
    const result = await sendMessage(actor.ownerId, actor, req.params.conversationId, validation.value);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo enviar el mensaje');
  }
}

export async function markMessagesReadHandler(req: AuthenticatedRequest, res: Response) {
  const validation = validateMarkRead(req.body);
  if (validation.errors.length || !validation.value) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const actor = resolveActor(req);
    const result = await markMessagesRead(actor.ownerId, actor, validation.value);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudieron marcar los mensajes como leídos');
  }
}

export async function closeConversationHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const actor = resolveActor(req);
    const result = await closeConversation(actor.ownerId, actor, req.params.conversationId);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo cerrar la conversación');
  }
}

export async function reopenConversationHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const actor = resolveActor(req);
    const result = await reopenConversation(actor.ownerId, actor, req.params.conversationId);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo reabrir la conversación');
  }
}

export async function addAttachmentLinkHandler(req: AuthenticatedRequest, res: Response) {
  const body = req.body ?? {};
  const errors: string[] = [];
  const type = String(body.type ?? '').trim().toUpperCase();
  const name = sanitizePlainText(String(body.name ?? '').trim());
  const url = String(body.url ?? '').trim();
  if (!['FILE', 'LINK', 'DOCUMENT'].includes(type)) {
    errors.push('type inválido');
  }
  if (!name) {
    errors.push('name es obligatorio');
  }
  if (!url) {
    errors.push('url es obligatoria');
  }
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const actor = resolveActor(req);
    const result = await addAttachmentLink(actor.ownerId, actor, {
      conversationId: String(body.conversationId ?? req.body?.conversationId ?? '').trim(),
      messageId: String(body.messageId ?? '').trim(),
      type: type as 'FILE' | 'LINK' | 'DOCUMENT',
      name,
      url,
      mimeType: body.mimeType ? String(body.mimeType).trim() : null,
      storagePath: body.storagePath ? String(body.storagePath).trim() : null,
      sizeBytes: body.sizeBytes !== undefined ? Number(body.sizeBytes) : null,
      checksum: body.checksum ? String(body.checksum).trim() : null
    });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo adjuntar el recurso');
  }
}

export async function listUnreadMessagesHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const actor = resolveActor(req);
    const result = await listUnreadMessages(actor.ownerId, actor);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudieron cargar los mensajes no leídos');
  }
}

export async function getOpenConversationCountHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const actor = resolveActor(req);
    const result = await getOpenConversationCount(actor.ownerId, actor);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'No se pudo cargar el contador de conversaciones');
  }
}

export async function openCommunicationsStreamHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const actor = resolveActor(req);
    const closeStream = openCommunicationsStream(actor, res);
    req.on('close', closeStream);
    res.on('close', closeStream);
  } catch (error) {
    handleError(res, error, 'No se pudo abrir el stream');
  }
}
