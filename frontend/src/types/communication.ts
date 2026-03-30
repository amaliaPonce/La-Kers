export type CommunicationStatus = 'OPEN' | 'CLOSED';
export type CommunicationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type CommunicationCategory =
  | 'INCIDENCE'
  | 'PAYMENT'
  | 'CONTRACT'
  | 'MAINTENANCE'
  | 'DOCUMENTATION'
  | 'GENERAL_NOTICE'
  | 'QUESTION'
  | 'URGENT';
export type CommunicationScopeType = 'GENERAL' | 'PROPERTY' | 'LEASE';
export type CommunicationVisibility = 'EXTERNAL' | 'INTERNAL';

export type CommunicationParticipant = {
  actorType: 'OWNER' | 'TENANT' | 'ADMIN' | 'SYSTEM';
  actorRef: string;
  displayName: string;
  participantRole: string;
};

export type CommunicationConversationListItem = {
  id: string;
  subject: string;
  status: CommunicationStatus;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  scopeType: CommunicationScopeType;
  unitId: string | null;
  leaseId: string | null;
  participants: CommunicationParticipant[];
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageAuthor: string | null;
  createdAt: string;
  closedAt: string | null;
};

export type CommunicationMessageAttachment = {
  id: string;
  type: 'FILE' | 'LINK' | 'DOCUMENT';
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  storagePath: string | null;
};

export type CommunicationMessage = {
  id: string;
  body: string;
  visibility: CommunicationVisibility;
  messageType: 'USER' | 'SYSTEM' | 'NOTE';
  category: CommunicationCategory | null;
  priority: CommunicationPriority | null;
  createdAt: string;
  sender: {
    participantId: string;
    actorType: 'OWNER' | 'TENANT' | 'ADMIN' | 'SYSTEM';
    actorRef: string;
    displayName: string;
  };
  attachments: CommunicationMessageAttachment[];
  readByCurrentActor: boolean;
};

export type CommunicationConversationDetail = {
  conversation: CommunicationConversationListItem;
  messages: CommunicationMessage[];
};
