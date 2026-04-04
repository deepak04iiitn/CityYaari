import express from 'express';
import {
  searchUsers,
  getUserProfile,
  sendConnectionRequest,
  respondToConnectionRequest,
  getConnectionRequests,
  getMyConnections,
  removeConnection,
  getMyPosts,
  getMySavedPosts,
  getMyActivitySummary,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/me/activity-summary', protect, getMyActivitySummary);
router.get('/me/connections', protect, getMyConnections);
router.get('/me/posts', protect, getMyPosts);
router.get('/me/saved-posts', protect, getMySavedPosts);
router.get('/me/connection-requests', protect, getConnectionRequests);
router.post('/:userId/connection-request', protect, sendConnectionRequest);
router.post('/:userId/connection-request/respond', protect, respondToConnectionRequest);
router.delete('/:userId/connections', protect, removeConnection);
router.get('/:username', protect, getUserProfile);

export default router;