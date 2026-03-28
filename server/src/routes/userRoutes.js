import express from 'express';
import { searchUsers, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:username', protect, getUserProfile);

export default router;