import express from 'express';
import {
  getUnreadCount,
  listConversationMessages,
  listMyConversations,
  readConversation,
  sendMessage,
  clearChat,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/unread-count', getUnreadCount);
router.get('/conversations', listMyConversations);
router.get('/:userId/messages', listConversationMessages);
router.post('/:userId/messages', sendMessage);
router.put('/:userId/read', readConversation);
router.delete('/:userId', clearChat);

export default router;