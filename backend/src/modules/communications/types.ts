export type CommunicationActorType = 'OWNER' | 'TENANT' | 'ADMIN' | 'SYSTEM';
export type CommunicationScopeType = 'GENERAL' | 'PROPERTY' | 'LEASE';
export type CommunicationCategory =
  | 'INCIDENCE'
  | 'PAYMENT'
  | 'CONTRACT'
  | 'MAINTENANCE'
  | 'DOCUMENTATION'
  | 'GENERAL_NOTICE'
  | 'QUESTION'
  | 'URGENT';
export type CommunicationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type CommunicationStatus = 'OPEN' | 'CLOSED';
export type CommunicationVisibility = 'EXTERNAL' | 'INTERNAL';
export type CommunicationMessageType = 'USER' | 'SYSTEM' | 'NOTE';
export type CommunicationAttachmentType = 'FILE' | 'LINK' | 'DOCUMENT';

export type CommunicationActorContext = {
  authUserId: string;
  actorType: CommunicationActorType;
  actorRef: string;
  ownerId: string;
  tenantPersonId?: string | null;
  portal?: 'owner' | 'tenant';
};

export type CommunicationConversationRecord = {
  id: string;
  owner_id: string;
  scope_type: CommunicationScopeType;
  unit_id: string | null;
  lease_id: string | null;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  status: CommunicationStatus;
  subject: string;
  opened_by_actor_type: CommunicationActorType;
  opened_by_actor_ref: string;
  closed_at: string | null;
  reopened_at: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_author_label: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunicationParticipantRecord = {
  id: string;
  conversation_id: string;
  actor_type: CommunicationActorType;
  actor_ref: string;
  tenant_person_id: string | null;
  display_name: string;
  participant_role: 'OWNER' | 'TENANT' | 'ADMIN' | 'WATCHER';
  can_read: boolean;
  can_write: boolean;
  can_close: boolean;
  notification_email: string | null;
  last_read_message_id: string | null;
  last_read_at: string | null;
  created_at: string;
};

export type CommunicationMessageRecord = {
  id: string;
  conversation_id: string;
  sender_participant_id: string;
  message_type: CommunicationMessageType;
  visibility: CommunicationVisibility;
  body: string;
  body_format: 'plain_text';
  category: CommunicationCategory | null;
  priority: CommunicationPriority | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  edited_at: string | null;
};

export type CommunicationAttachmentRecord = {
  id: string;
  message_id: string;
  attachment_type: CommunicationAttachmentType;
  name: string;
  mime_type: string | null;
  storage_path: string | null;
  url: string;
  size_bytes: number | null;
  checksum: string | null;
  created_at: string;
};

export type ConversationListItem = {
  id: string;
  subject: string;
  status: CommunicationStatus;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  scopeType: CommunicationScopeType;
  unitId: string | null;
  leaseId: string | null;
  participants: Array<{
    actorType: CommunicationActorType;
    actorRef: string;
    displayName: string;
    participantRole: string;
  }>;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageAuthor: string | null;
  createdAt: string;
  closedAt: string | null;
};

export type ConversationDetail = {
  conversation: ConversationListItem;
  messages: Array<{
    id: string;
    body: string;
    visibility: CommunicationVisibility;
    messageType: CommunicationMessageType;
    category: CommunicationCategory | null;
    priority: CommunicationPriority | null;
    createdAt: string;
    sender: {
      participantId: string;
      actorType: CommunicationActorType;
      actorRef: string;
      displayName: string;
    };
    attachments: Array<{
      id: string;
      type: CommunicationAttachmentType;
      name: string;
      url: string;
      mimeType: string | null;
      sizeBytes: number | null;
      storagePath: string | null;
    }>;
    readByCurrentActor: boolean;
  }>;
};
