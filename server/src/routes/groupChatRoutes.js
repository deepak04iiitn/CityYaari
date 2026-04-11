import express from 'express';
import {
  getGroupMessages,
  sendGroupMessage,
  sendGroupImage,
  reactToGroupMessage,
  markGroupOneTimeViewed,
  markGroupAsRead,
  getGroupChatSummaries,
} from '../controllers/groupChatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleChatImageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summaries', getGroupChatSummaries);
router.get('/:meetupId/messages', getGroupMessages);
router.post('/:meetupId/messages', sendGroupMessage);
router.post('/:meetupId/image', handleChatImageUpload, sendGroupImage);
router.post('/react/:messageId', reactToGroupMessage);
router.post('/one-time-view/:messageId', markGroupOneTimeViewed);
router.post('/:meetupId/read', markGroupAsRead);

export default router;
