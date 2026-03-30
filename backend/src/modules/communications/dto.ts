import {
  CommunicationActorType,
  CommunicationAttachmentType,
  CommunicationCategory,
  CommunicationPriority,
  CommunicationScopeType,
  CommunicationStatus,
  CommunicationVisibility
} from './types';

export type CreateConversationAttachmentInput = {
  type: CommunicationAttachmentType;
  name: string;
  url: string;
  mimeType?: string | null;
  storagePath?: string | null;
  sizeBytes?: number | null;
  checksum?: string | null;
};

export type CreateConversationInput = {
  subject: string;
  tenantPersonId: string;
  unitId?: string | null;
  leaseId?: string | null;
  scopeType: CommunicationScopeType;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  initialMessage: string;
  visibility?: CommunicationVisibility;
  attachments?: CreateConversationAttachmentInput[];
};

export type ListConversationsFilters = {
  unitId?: string;
  leaseId?: string;
  status?: CommunicationStatus;
  category?: CommunicationCategory;
  priority?: CommunicationPriority;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
};

export type SendMessageInput = {
  body: string;
  visibility?: CommunicationVisibility;
  category?: CommunicationCategory | null;
  priority?: CommunicationPriority | null;
  attachments?: CreateConversationAttachmentInput[];
};

export type MarkMessagesReadInput = {
  conversationId?: string;
  messageIds?: string[];
};

export type AttachmentLinkInput = {
  conversationId: string;
  messageId: string;
  type: CommunicationAttachmentType;
  name: string;
  url: string;
  mimeType?: string | null;
  storagePath?: string | null;
  sizeBytes?: number | null;
  checksum?: string | null;
};

export type ConversationSummaryResponse = {
  items: Array<{
    id: string;
    subject: string;
    status: CommunicationStatus;
    category: CommunicationCategory;
    priority: CommunicationPriority;
    scopeType: CommunicationScopeType;
    unitId: string | null;
    leaseId: string | null;
    unreadCount: number;
    lastMessageAt: string | null;
    lastMessagePreview: string | null;
    lastMessageAuthor: string | null;
    participants: Array<{
      actorType: CommunicationActorType;
      actorRef: string;
      displayName: string;
      participantRole: string;
    }>;
    createdAt: string;
    closedAt: string | null;
  }>;
  pagination: {
    limit: number;
    offset: number;
    returned: number;
  };
};
