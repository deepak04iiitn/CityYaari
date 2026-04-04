import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadNotificationsCount);
router.put('/read-all', protect, markAllNotificationsAsRead);

export default router;