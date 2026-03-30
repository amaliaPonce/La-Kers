import { Router } from 'express';
import { createRateLimiter } from '../middleware/rateLimit';
import {
  addAttachmentLinkHandler,
  closeConversationHandler,
  createConversationHandler,
  getConversationDetailHandler,
  getOpenConversationCountHandler,
  listConversationsHandler,
  listUnreadMessagesHandler,
  markMessagesReadHandler,
  openCommunicationsStreamHandler,
  reopenConversationHandler,
  sendMessageHandler
} from '../modules/communications/controller';

const router = Router();

const writeLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 60,
  message: 'Demasiadas acciones de mensajería, inténtalo de nuevo en un minuto',
  keyPrefix: 'communications-write'
});

router.get('/stream', openCommunicationsStreamHandler);
router.get('/conversations', listConversationsHandler);
router.get('/conversations/open-count', getOpenConversationCountHandler);
router.get('/messages/unread', listUnreadMessagesHandler);
router.get('/conversations/:conversationId', getConversationDetailHandler);
router.post('/conversations', writeLimiter, createConversationHandler);
router.post('/conversations/:conversationId/messages', writeLimiter, sendMessageHandler);
router.post('/messages/read', writeLimiter, markMessagesReadHandler);
router.post('/conversations/:conversationId/close', writeLimiter, closeConversationHandler);
router.post('/conversations/:conversationId/reopen', writeLimiter, reopenConversationHandler);
router.post('/attachments/links', writeLimiter, addAttachmentLinkHandler);

export default router;
