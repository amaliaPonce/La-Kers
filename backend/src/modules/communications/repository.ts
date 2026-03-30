import { supabaseAdmin } from '../../config/supabaseClient';
import {
  CommunicationActorContext,
  CommunicationAttachmentRecord,
  CommunicationConversationRecord,
  CommunicationMessageRecord,
  CommunicationParticipantRecord
} from './types';

type ConversationInsert = {
  owner_id: string;
  scope_type: string;
  unit_id: string | null;
  lease_id: string | null;
  category: string;
  priority: string;
  status: string;
  subject: string;
  opened_by_actor_type: string;
  opened_by_actor_ref: string;
};

type ParticipantInsert = {
  conversation_id: string;
  actor_type: string;
  actor_ref: string;
  tenant_person_id?: string | null;
  display_name: string;
  participant_role: string;
  can_read: boolean;
  can_write: boolean;
  can_close: boolean;
  notification_email?: string | null;
};

type MessageInsert = {
  conversation_id: string;
  sender_participant_id: string;
  message_type: string;
  visibility: string;
  body: string;
  body_format: 'plain_text';
  category: string | null;
  priority: string | null;
  metadata: Record<string, unknown> | null;
};

type AttachmentInsert = {
  message_id: string;
  attachment_type: string;
  name: string;
  mime_type?: string | null;
  storage_path?: string | null;
  url: string;
  size_bytes?: number | null;
  checksum?: string | null;
};

export async function insertConversation(payload: ConversationInsert) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversations')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunicationConversationRecord;
}

export async function insertConversationParticipants(payload: ParticipantInsert[]) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversation_participants')
    .insert(payload)
    .select('*');
  if (error) throw error;
  return (data ?? []) as CommunicationParticipantRecord[];
}

export async function insertMessage(payload: MessageInsert) {
  const { data, error } = await supabaseAdmin
    .from('communication_messages')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunicationMessageRecord;
}

export async function insertMessageAttachments(payload: AttachmentInsert[]) {
  if (!payload.length) return [];
  const { data, error } = await supabaseAdmin
    .from('communication_message_attachments')
    .insert(payload)
    .select('*');
  if (error) throw error;
  return (data ?? []) as CommunicationAttachmentRecord[];
}

export async function touchConversationLastMessage(conversationId: string, authorLabel: string, body: string, at: string) {
  const { error } = await supabaseAdmin
    .from('communication_conversations')
    .update({
      last_message_at: at,
      last_message_preview: body.slice(0, 220),
      last_message_author_label: authorLabel,
      updated_at: at
    })
    .eq('id', conversationId);
  if (error) throw error;
}

export async function appendAuditLog(payload: {
  ownerId: string;
  conversationId?: string;
  messageId?: string;
  actorType: string;
  actorRef: string;
  action: string;
  metadata?: Record<string, unknown> | null;
}) {
  const { error } = await supabaseAdmin.from('communication_audit_log').insert({
    owner_id: payload.ownerId,
    conversation_id: payload.conversationId ?? null,
    message_id: payload.messageId ?? null,
    actor_type: payload.actorType,
    actor_ref: payload.actorRef,
    action: payload.action,
    metadata: payload.metadata ?? null
  });
  if (error) throw error;
}

export async function insertNotifications(payload: Array<{
  ownerId: string;
  conversationId: string;
  messageId?: string;
  recipientActorType: string;
  recipientActorRef: string;
  channel: 'IN_APP' | 'EMAIL';
  notificationType: string;
  title: string;
  body: string;
  dedupeKey?: string;
  metadata?: Record<string, unknown> | null;
}>) {
  if (!payload.length) return;
  const { error } = await supabaseAdmin.from('communication_notifications').insert(
    payload.map((item) => ({
      owner_id: item.ownerId,
      conversation_id: item.conversationId,
      message_id: item.messageId ?? null,
      recipient_actor_type: item.recipientActorType,
      recipient_actor_ref: item.recipientActorRef,
      channel: item.channel,
      notification_type: item.notificationType,
      title: item.title,
      body: item.body,
      dedupe_key: item.dedupeKey ?? null,
      metadata: item.metadata ?? null
    }))
  );
  if (error) throw error;
}

export async function getConversationForOwner(ownerId: string, conversationId: string) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return (data as CommunicationConversationRecord | null) ?? null;
}

export async function getConversationById(ownerId: string, conversationId: string) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return (data as CommunicationConversationRecord | null) ?? null;
}

export async function getParticipantsForConversation(conversationId: string) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CommunicationParticipantRecord[];
}

export async function getActorParticipant(conversationId: string, actor: CommunicationActorContext) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('actor_type', actor.actorType)
    .eq('actor_ref', actor.actorRef)
    .maybeSingle();
  if (error) throw error;
  return (data as CommunicationParticipantRecord | null) ?? null;
}

export async function getMessagesForConversation(conversationId: string) {
  const { data, error } = await supabaseAdmin
    .from('communication_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CommunicationMessageRecord[];
}

export async function getAttachmentsForMessages(messageIds: string[]) {
  if (!messageIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from('communication_message_attachments')
    .select('*')
    .in('message_id', messageIds);
  if (error) throw error;
  return (data ?? []) as CommunicationAttachmentRecord[];
}

export async function getReadsForParticipant(participantId: string, messageIds: string[]) {
  if (!messageIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from('communication_message_reads')
    .select('message_id')
    .eq('participant_id', participantId)
    .in('message_id', messageIds);
  if (error) throw error;
  return (data ?? []) as Array<{ message_id: string }>;
}

export async function listConversationsForOwner(
  ownerId: string,
  filters: {
    unitId?: string;
    leaseId?: string;
    status?: string;
    category?: string;
    priority?: string;
    limit: number;
    offset: number;
  }
) {
  let query = supabaseAdmin
    .from('communication_conversations')
    .select('*')
    .eq('owner_id', ownerId)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);

  if (filters.unitId) {
    query = query.eq('unit_id', filters.unitId);
  }
  if (filters.leaseId) {
    query = query.eq('lease_id', filters.leaseId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CommunicationConversationRecord[];
}

export async function listConversationIdsForActor(actor: CommunicationActorContext) {
  const { data, error } = await supabaseAdmin
    .from('communication_conversation_participants')
    .select('conversation_id')
    .eq('actor_type', actor.actorType)
    .eq('actor_ref', actor.actorRef);
  if (error) throw error;
  return (data ?? []).map((row: any) => String(row.conversation_id ?? '')).filter(Boolean);
}

export async function listConversationsByIds(
  ownerId: string,
  conversationIds: string[],
  filters: {
    unitId?: string;
    leaseId?: string;
    status?: string;
    category?: string;
    priority?: string;
    limit: number;
    offset: number;
  }
) {
  if (!conversationIds.length) {
    return [];
  }

  let query = supabaseAdmin
    .from('communication_conversations')
    .select('*')
    .eq('owner_id', ownerId)
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);

  if (filters.unitId) {
    query = query.eq('unit_id', filters.unitId);
  }
  if (filters.leaseId) {
    query = query.eq('lease_id', filters.leaseId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CommunicationConversationRecord[];
}

export async function getParticipantsForConversations(conversationIds: string[]) {
  if (!conversationIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from('communication_conversation_participants')
    .select('*')
    .in('conversation_id', conversationIds);
  if (error) throw error;
  return (data ?? []) as CommunicationParticipantRecord[];
}

export async function getMessagesForConversations(conversationIds: string[]) {
  if (!conversationIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from('communication_messages')
    .select('id, conversation_id, sender_participant_id, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<Pick<CommunicationMessageRecord, 'id' | 'conversation_id' | 'sender_participant_id' | 'created_at'>>;
}

export async function closeConversationRecord(conversationId: string, actor: CommunicationActorContext) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('communication_conversations')
    .update({
      status: 'CLOSED',
      closed_at: now,
      closed_by_actor_type: actor.actorType,
      closed_by_actor_ref: actor.actorRef,
      updated_at: now
    })
    .eq('id', conversationId)
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunicationConversationRecord;
}

export async function reopenConversationRecord(conversationId: string, actor: CommunicationActorContext) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('communication_conversations')
    .update({
      status: 'OPEN',
      reopened_at: now,
      reopened_by_actor_type: actor.actorType,
      reopened_by_actor_ref: actor.actorRef,
      updated_at: now
    })
    .eq('id', conversationId)
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunicationConversationRecord;
}

export async function markMessagesReadForParticipant(participantId: string, messageIds: string[]) {
  if (!messageIds.length) return [];
  const readAt = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('communication_message_reads')
    .upsert(
      messageIds.map((messageId) => ({
        message_id: messageId,
        participant_id: participantId,
        read_at: readAt
      })),
      { onConflict: 'message_id,participant_id' }
    )
    .select('*');
  if (error) throw error;
  return data ?? [];
}

export async function updateParticipantReadCursor(participantId: string, lastReadMessageId: string) {
  const { error } = await supabaseAdmin
    .from('communication_conversation_participants')
    .update({
      last_read_message_id: lastReadMessageId,
      last_read_at: new Date().toISOString()
    })
    .eq('id', participantId);
  if (error) throw error;
}

export async function countOpenConversationsForOwner(ownerId: string) {
  const { count, error } = await supabaseAdmin
    .from('communication_conversations')
    .select('id', { head: true, count: 'exact' })
    .eq('owner_id', ownerId)
    .eq('status', 'OPEN');
  if (error) throw error;
  return count ?? 0;
}

export async function countOpenConversationsByIds(ownerId: string, conversationIds: string[]) {
  if (!conversationIds.length) return 0;
  const { count, error } = await supabaseAdmin
    .from('communication_conversations')
    .select('id', { head: true, count: 'exact' })
    .eq('owner_id', ownerId)
    .eq('status', 'OPEN')
    .in('id', conversationIds);
  if (error) throw error;
  return count ?? 0;
}
