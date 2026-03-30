import {
  AttachmentLinkInput,
  CreateConversationInput,
  ListConversationsFilters,
  MarkMessagesReadInput,
  SendMessageInput
} from './dto';
import {
  CommunicationActorContext,
  CommunicationConversationRecord,
  CommunicationMessageRecord,
  CommunicationParticipantRecord,
  ConversationDetail,
  ConversationListItem
} from './types';
import { ensureLeaseMatchesTenantAndUnit, ensureOwnerHasCommunicationsPro } from './policies';
import {
  appendAuditLog,
  closeConversationRecord,
  countOpenConversationsByIds,
  countOpenConversationsForOwner,
  getActorParticipant,
  getAttachmentsForMessages,
  getConversationById,
  getConversationForOwner,
  getMessagesForConversation,
  getMessagesForConversations,
  getParticipantsForConversation,
  getParticipantsForConversations,
  getReadsForParticipant,
  insertConversation,
  insertConversationParticipants,
  insertMessage,
  insertMessageAttachments,
  insertNotifications,
  listConversationIdsForActor,
  listConversationsByIds,
  listConversationsForOwner,
  markMessagesReadForParticipant,
  reopenConversationRecord,
  touchConversationLastMessage,
  updateParticipantReadCursor
} from './repository';
import { notifyCommunicationsUpdated } from './realtime';

function buildParticipantMap(participants: CommunicationParticipantRecord[]) {
  return new Map(participants.map((participant) => [participant.id, participant]));
}

function buildUnreadCounts(
  conversations: CommunicationConversationRecord[],
  actor: CommunicationActorContext,
  participants: CommunicationParticipantRecord[],
  messages: Array<Pick<CommunicationMessageRecord, 'conversation_id' | 'sender_participant_id' | 'created_at'>>
) {
  const actorParticipants = new Map(
    participants
      .filter((participant) => participant.actor_type === actor.actorType && participant.actor_ref === actor.actorRef)
      .map((participant) => [participant.conversation_id, participant])
  );
  const unreadCounts = new Map<string, number>();

  for (const conversation of conversations) {
    const actorParticipant = actorParticipants.get(conversation.id);
    const lastReadAt = actorParticipant?.last_read_at ? Date.parse(actorParticipant.last_read_at) : 0;
    let unread = 0;
    for (const message of messages) {
      if (message.conversation_id !== conversation.id) continue;
      if (actorParticipant && message.sender_participant_id === actorParticipant.id) continue;
      const createdAt = Date.parse(message.created_at);
      if (!lastReadAt || createdAt > lastReadAt) {
        unread += 1;
      }
    }
    unreadCounts.set(conversation.id, unread);
  }

  return unreadCounts;
}

function toListItem(
  conversation: CommunicationConversationRecord,
  participants: CommunicationParticipantRecord[],
  unreadCount: number
): ConversationListItem {
  return {
    id: conversation.id,
    subject: conversation.subject,
    status: conversation.status,
    category: conversation.category,
    priority: conversation.priority,
    scopeType: conversation.scope_type,
    unitId: conversation.unit_id,
    leaseId: conversation.lease_id,
    participants: participants.map((participant) => ({
      actorType: participant.actor_type,
      actorRef: participant.actor_ref,
      displayName: participant.display_name,
      participantRole: participant.participant_role
    })),
    unreadCount,
    lastMessageAt: conversation.last_message_at,
    lastMessagePreview: conversation.last_message_preview,
    lastMessageAuthor: conversation.last_message_author_label,
    createdAt: conversation.created_at,
    closedAt: conversation.closed_at
  };
}

async function assertConversationWriteAccess(ownerId: string, conversationId: string, actor: CommunicationActorContext) {
  const conversation = await getConversationById(ownerId, conversationId);
  if (!conversation) {
    const error = new Error('Conversación no encontrada');
    (error as any).status = 404;
    throw error;
  }
  const participant = await getActorParticipant(conversationId, actor);
  if (!participant || !participant.can_write) {
    const error = new Error('No tienes permisos de escritura sobre esta conversación');
    (error as any).status = 403;
    throw error;
  }
  return { conversation, participant };
}

async function buildConversationDetail(
  conversation: CommunicationConversationRecord,
  participants: CommunicationParticipantRecord[],
  currentParticipant: CommunicationParticipantRecord
): Promise<ConversationDetail> {
  const messages = await getMessagesForConversation(conversation.id);
  const attachments = await getAttachmentsForMessages(messages.map((message) => message.id));
  const readRows = await getReadsForParticipant(
    currentParticipant.id,
    messages.map((message) => message.id)
  );

  const attachmentsByMessageId = new Map<string, ReturnType<typeof attachments.filter>>();
  for (const attachment of attachments) {
    const bucket = attachmentsByMessageId.get(attachment.message_id) ?? [];
    bucket.push(attachment);
    attachmentsByMessageId.set(attachment.message_id, bucket);
  }
  const readMessageIds = new Set(readRows.map((row) => row.message_id));
  const participantMap = buildParticipantMap(participants);
  const unreadCount = messages.filter(
    (message) =>
      message.sender_participant_id !== currentParticipant.id &&
      !readMessageIds.has(message.id)
  ).length;

  return {
    conversation: toListItem(conversation, participants, unreadCount),
    messages: messages.map((message) => {
      const sender = participantMap.get(message.sender_participant_id);
      return {
        id: message.id,
        body: message.body,
        visibility: message.visibility,
        messageType: message.message_type,
        category: message.category,
        priority: message.priority,
        createdAt: message.created_at,
        sender: {
          participantId: sender?.id ?? message.sender_participant_id,
          actorType: sender?.actor_type ?? 'SYSTEM',
          actorRef: sender?.actor_ref ?? 'system',
          displayName: sender?.display_name ?? 'Sistema'
        },
        attachments: (attachmentsByMessageId.get(message.id) ?? []).map((attachment) => ({
          id: attachment.id,
          type: attachment.attachment_type,
          name: attachment.name,
          url: attachment.url,
          mimeType: attachment.mime_type,
          sizeBytes: attachment.size_bytes,
          storagePath: attachment.storage_path
        })),
        readByCurrentActor: readMessageIds.has(message.id)
      };
    })
  };
}

export async function createConversation(ownerId: string, actor: CommunicationActorContext, input: CreateConversationInput) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const tenant = await ensureLeaseMatchesTenantAndUnit(ownerId, input.tenantPersonId, input.unitId, input.leaseId);
  if (actor.actorType === 'TENANT' && actor.tenantPersonId !== tenant.id) {
    const error = new Error('Un inquilino solo puede abrir conversaciones sobre su propio contrato');
    (error as any).status = 403;
    throw error;
  }
  const conversationUnitId = input.scopeType === 'GENERAL' ? null : input.unitId ?? tenant.unit_id ?? null;
  const conversationLeaseId = input.scopeType === 'LEASE' ? input.leaseId ?? tenant.id : null;

  const conversation = await insertConversation({
    owner_id: ownerId,
    scope_type: input.scopeType,
    unit_id: conversationUnitId,
    lease_id: conversationLeaseId,
    category: input.category,
    priority: input.priority,
    status: 'OPEN',
    subject: input.subject,
    opened_by_actor_type: actor.actorType,
    opened_by_actor_ref: actor.actorRef
  });

  const participants = await insertConversationParticipants([
    {
      conversation_id: conversation.id,
      actor_type: 'OWNER',
      actor_ref: ownerId,
      display_name: 'Propietario',
      participant_role: 'OWNER',
      can_read: true,
      can_write: true,
      can_close: true
    },
    {
      conversation_id: conversation.id,
      actor_type: 'TENANT',
      actor_ref: tenant.id,
      tenant_person_id: tenant.id,
      display_name: tenant.full_name,
      participant_role: 'TENANT',
      can_read: true,
      can_write: true,
      can_close: false,
      notification_email: tenant.email ?? null
    }
  ]);

  const senderParticipant = participants.find(
    (participant) => participant.actor_type === actor.actorType && participant.actor_ref === actor.actorRef
  );
  if (!senderParticipant) {
    throw new Error('No se pudo inicializar el participante emisor');
  }

  const message = await insertMessage({
    conversation_id: conversation.id,
    sender_participant_id: senderParticipant.id,
    message_type: 'USER',
    visibility: actor.actorType === 'TENANT' ? 'EXTERNAL' : input.visibility ?? 'EXTERNAL',
    body: input.initialMessage,
    body_format: 'plain_text',
    category: input.category,
    priority: input.priority,
    metadata: null
  });

  const attachments = await insertMessageAttachments(
    (input.attachments ?? []).map((attachment) => ({
      message_id: message.id,
      attachment_type: attachment.type,
      name: attachment.name,
      mime_type: attachment.mimeType ?? null,
      storage_path: attachment.storagePath ?? null,
      url: attachment.url,
      size_bytes: attachment.sizeBytes ?? null,
      checksum: attachment.checksum ?? null
    }))
  );

  await touchConversationLastMessage(conversation.id, senderParticipant.display_name, message.body, message.created_at);
  await updateParticipantReadCursor(senderParticipant.id, message.id);
  await markMessagesReadForParticipant(senderParticipant.id, [message.id]);

  await appendAuditLog({
    ownerId,
    conversationId: conversation.id,
    actorType: actor.actorType,
    actorRef: actor.actorRef,
    action: 'CONVERSATION_CREATED',
    metadata: {
      category: input.category,
      priority: input.priority,
      scopeType: input.scopeType
    }
  });
  await appendAuditLog({
    ownerId,
    conversationId: conversation.id,
    messageId: message.id,
    actorType: actor.actorType,
    actorRef: actor.actorRef,
    action: 'MESSAGE_SENT',
    metadata: {
      attachmentCount: attachments.length
    }
  });

  await insertNotifications([
    {
      ownerId,
      conversationId: conversation.id,
      messageId: message.id,
      recipientActorType: actor.actorType === 'TENANT' ? 'OWNER' : 'TENANT',
      recipientActorRef: actor.actorType === 'TENANT' ? ownerId : tenant.id,
      channel: 'IN_APP',
      notificationType: input.priority === 'urgent' ? 'URGENT_MESSAGE' : 'NEW_CONVERSATION',
      title: input.subject,
      body: message.body.slice(0, 160),
      dedupeKey: `conversation:${conversation.id}:message:${message.id}:${actor.actorType === 'TENANT' ? 'owner' : 'tenant'}:in_app`
    },
    ...(actor.actorType !== 'TENANT' && tenant.email
      ? [
          {
            ownerId,
            conversationId: conversation.id,
            messageId: message.id,
            recipientActorType: 'TENANT',
            recipientActorRef: tenant.id,
            channel: 'EMAIL' as const,
            notificationType: input.priority === 'urgent' ? 'URGENT_MESSAGE' : 'NEW_CONVERSATION',
            title: input.subject,
            body: message.body.slice(0, 160),
            dedupeKey: `conversation:${conversation.id}:message:${message.id}:tenant:email`
          }
        ]
      : [])
  ]);

  notifyCommunicationsUpdated(
    participants.map((participant) => ({
      ownerId,
      actorType: participant.actor_type,
      actorRef: participant.actor_ref
    })),
    'conversation-created',
    {
    source: 'communications.conversation.created',
    conversationId: conversation.id
    }
  );

  return getConversationDetail(ownerId, actor, conversation.id);
}

export async function listConversations(ownerId: string, actor: CommunicationActorContext, filters: ListConversationsFilters) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const conversationQuery = {
    unitId: filters.unitId,
    leaseId: actor.actorType === 'TENANT' ? actor.tenantPersonId ?? filters.leaseId : filters.leaseId,
    status: filters.status,
    category: filters.category,
    priority: filters.priority,
    limit: filters.limit ?? 25,
    offset: filters.offset ?? 0
  };
  const conversations =
    actor.actorType === 'OWNER'
      ? await listConversationsForOwner(ownerId, conversationQuery)
      : await listConversationsByIds(ownerId, await listConversationIdsForActor(actor), conversationQuery);
  const conversationIds = conversations.map((conversation) => conversation.id);
  const participants = await getParticipantsForConversations(conversationIds);
  const messages = await getMessagesForConversations(conversationIds);
  const unreadCounts = buildUnreadCounts(conversations, actor, participants, messages);

  let items = conversations.map((conversation) =>
    toListItem(
      conversation,
      participants.filter((participant) => participant.conversation_id === conversation.id),
      unreadCounts.get(conversation.id) ?? 0
    )
  );

  if (filters.unreadOnly) {
    items = items.filter((item) => item.unreadCount > 0);
  }

  return {
    items,
    pagination: {
      limit: filters.limit ?? 25,
      offset: filters.offset ?? 0,
      returned: items.length
    }
  };
}

export async function getConversationDetail(ownerId: string, actor: CommunicationActorContext, conversationId: string) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const conversation = await getConversationById(ownerId, conversationId);
  if (!conversation) {
    const error = new Error('Conversación no encontrada');
    (error as any).status = 404;
    throw error;
  }
  const participants = await getParticipantsForConversation(conversationId);
  const currentParticipant = await getActorParticipant(conversationId, actor);
  if (!currentParticipant) {
    const error = new Error('No tienes acceso a esta conversación');
    (error as any).status = 403;
    throw error;
  }
  return buildConversationDetail(conversation, participants, currentParticipant);
}

export async function sendMessage(ownerId: string, actor: CommunicationActorContext, conversationId: string, input: SendMessageInput) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const { conversation, participant } = await assertConversationWriteAccess(ownerId, conversationId, actor);
  if (conversation.status === 'CLOSED') {
    const error = new Error('La conversación está cerrada');
    (error as any).status = 409;
    throw error;
  }

  const message = await insertMessage({
    conversation_id: conversationId,
    sender_participant_id: participant.id,
    message_type: 'USER',
    visibility: actor.actorType === 'TENANT' ? 'EXTERNAL' : input.visibility ?? 'EXTERNAL',
    body: input.body,
    body_format: 'plain_text',
    category: input.category ?? null,
    priority: input.priority ?? null,
    metadata: null
  });

  const attachments = await insertMessageAttachments(
    (input.attachments ?? []).map((attachment) => ({
      message_id: message.id,
      attachment_type: attachment.type,
      name: attachment.name,
      mime_type: attachment.mimeType ?? null,
      storage_path: attachment.storagePath ?? null,
      url: attachment.url,
      size_bytes: attachment.sizeBytes ?? null,
      checksum: attachment.checksum ?? null
    }))
  );

  await touchConversationLastMessage(conversationId, participant.display_name, input.body, message.created_at);
  await updateParticipantReadCursor(participant.id, message.id);
  await markMessagesReadForParticipant(participant.id, [message.id]);

  const participants = await getParticipantsForConversation(conversationId);
  const recipients = participants.filter((item) => item.id !== participant.id && item.can_read);

  await appendAuditLog({
    ownerId,
    conversationId,
    messageId: message.id,
    actorType: actor.actorType,
    actorRef: actor.actorRef,
    action: 'MESSAGE_SENT',
    metadata: {
      attachmentCount: attachments.length,
      visibility: actor.actorType === 'TENANT' ? 'EXTERNAL' : input.visibility ?? 'EXTERNAL'
    }
  });

  await insertNotifications(
    recipients.flatMap((recipient) => {
      const notificationType = (input.priority ?? conversation.priority) === 'urgent' ? 'URGENT_MESSAGE' : 'NEW_MESSAGE';
      const base = {
        ownerId,
        conversationId,
        messageId: message.id,
        recipientActorType: recipient.actor_type,
        recipientActorRef: recipient.actor_ref,
        notificationType,
        title: conversation.subject,
        body: input.body.slice(0, 160)
      };
      const rows: Array<{
        ownerId: string;
        conversationId: string;
        messageId: string;
        recipientActorType: string;
        recipientActorRef: string;
        channel: 'IN_APP' | 'EMAIL';
        notificationType: string;
        title: string;
        body: string;
        dedupeKey: string;
      }> = [
        {
          ...base,
          channel: 'IN_APP' as const,
          dedupeKey: `conversation:${conversationId}:message:${message.id}:${recipient.actor_type}:${recipient.actor_ref}:in_app`
        }
      ];
      if (recipient.notification_email) {
        rows.push({
          ...base,
          channel: 'EMAIL' as const,
          dedupeKey: `conversation:${conversationId}:message:${message.id}:${recipient.actor_type}:${recipient.actor_ref}:email`
        });
      }
      return rows;
    })
  );

  notifyCommunicationsUpdated(
    participants.map((item) => ({
      ownerId,
      actorType: item.actor_type,
      actorRef: item.actor_ref
    })),
    'message-created',
    {
    source: 'communications.message.created',
    conversationId,
    messageId: message.id
    }
  );

  return getConversationDetail(ownerId, actor, conversationId);
}

export async function markMessagesRead(ownerId: string, actor: CommunicationActorContext, input: MarkMessagesReadInput) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const conversationId = input.conversationId ?? null;
  if (!conversationId) {
    const error = new Error('Esta implementación requiere conversationId para marcar leído');
    (error as any).status = 400;
    throw error;
  }

  const conversation = await getConversationById(ownerId, conversationId);
  if (!conversation) {
    const error = new Error('Conversación no encontrada');
    (error as any).status = 404;
    throw error;
  }
  const participant = await getActorParticipant(conversationId, actor);
  if (!participant) {
    const error = new Error('No tienes acceso a esta conversación');
    (error as any).status = 403;
    throw error;
  }

  const messages = await getMessagesForConversation(conversationId);
  const targetIds = (input.messageIds?.length ? input.messageIds : messages.map((message) => message.id)).filter(Boolean);
  if (!targetIds.length) {
    return { updated: 0 };
  }

  await markMessagesReadForParticipant(participant.id, targetIds);
  await updateParticipantReadCursor(participant.id, targetIds[targetIds.length - 1]);
  await appendAuditLog({
    ownerId,
    conversationId,
    actorType: actor.actorType,
    actorRef: actor.actorRef,
    action: 'MESSAGE_READ',
    metadata: {
      count: targetIds.length
    }
  });

  const participants = await getParticipantsForConversation(conversationId);
  notifyCommunicationsUpdated(
    participants.map((item) => ({
      ownerId,
      actorType: item.actor_type,
      actorRef: item.actor_ref
    })),
    'messages-read',
    {
    source: 'communications.messages.read',
    conversationId
    }
  );

  return { updated: targetIds.length };
}

export async function closeConversation(ownerId: string, actor: CommunicationActorContext, conversationId: string) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const { participant } = await assertConversationWriteAccess(ownerId, conversationId, actor);
  if (!participant.can_close) {
    const error = new Error('No tienes permisos para cerrar esta conversación');
    (error as any).status = 403;
    throw error;
  }
  const conversation = await closeConversationRecord(conversationId, actor);
  await appendAuditLog({
    ownerId,
    conversationId,
    actorType: actor.actorType,
    actorRef: actor.actorRef,
    action: 'CONVERSATION_CLOSED',
    metadata: null
  });
  const participants = await getParticipantsForConversation(conversationId);
  notifyCommunicationsUpdated(
    participants.map((item) => ({
      ownerId,
      actorType: item.actor_type,
      actorRef: item.actor_ref
    })),
    'conversation-closed',
    {
    source: 'communications.conversation.closed',
    conversationId
    }
  );
  return conversation;
}

export async function reopenConversation(ownerId: string, actor: CommunicationActorContext, conversationId: string) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const { participant } = await assertConversationWriteAccess(ownerId, conversationId, actor);
  if (!participant.can_close) {
    const error = new Error('No tienes permisos para reabrir esta conversación');
    (error as any).status = 403;
    throw error;
  }
  const conversation = await reopenConversationRecord(conversationId, actor);
  await appendAuditLog({
    ownerId,
    conversationId,
    actorType: actor.actorType,
    actorRef: actor.actorRef,
    action: 'CONVERSATION_REOPENED',
    metadata: null
  });
  const participants = await getParticipantsForConversation(conversationId);
  notifyCommunicationsUpdated(
    participants.map((item) => ({
      ownerId,
      actorType: item.actor_type,
      actorRef: item.actor_ref
    })),
    'conversation-reopened',
    {
    source: 'communications.conversation.reopened',
    conversationId
    }
  );
  return conversation;
}

export async function addAttachmentLink(ownerId: string, actor: CommunicationActorContext, input: AttachmentLinkInput) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const { participant } = await assertConversationWriteAccess(ownerId, input.conversationId, actor);
  const attachments = await insertMessageAttachments([
    {
      message_id: input.messageId,
      attachment_type: input.type,
      name: input.name,
      mime_type: input.mimeType ?? null,
      storage_path: input.storagePath ?? null,
      url: input.url,
      size_bytes: input.sizeBytes ?? null,
      checksum: input.checksum ?? null
    }
  ]);
  await appendAuditLog({
    ownerId,
    conversationId: input.conversationId,
    messageId: input.messageId,
    actorType: participant.actor_type,
    actorRef: participant.actor_ref,
    action: 'ATTACHMENT_ADDED',
    metadata: {
      attachmentType: input.type,
      name: input.name
    }
  });
  return attachments[0] ?? null;
}

export async function listUnreadMessages(ownerId: string, actor: CommunicationActorContext) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  const conversations = await listConversations(ownerId, actor, {
    unreadOnly: true,
    limit: 100,
    offset: 0
  });
  return conversations.items;
}

export async function getOpenConversationCount(ownerId: string, actor: CommunicationActorContext) {
  await ensureOwnerHasCommunicationsPro(ownerId);
  if (actor.actorType !== 'OWNER') {
    const conversationIds = await listConversationIdsForActor(actor);
    return {
      openCount: await countOpenConversationsByIds(ownerId, conversationIds)
    };
  }
  return {
    openCount: await countOpenConversationsForOwner(ownerId)
  };
}
