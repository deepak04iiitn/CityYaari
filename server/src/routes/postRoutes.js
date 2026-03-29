import express from 'express';
import { createPost, getPosts, toggleLikePost, toggleDislikePost, toggleSavePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handlePostImageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, handlePostImageUpload, createPost);

router.post('/:id/like', protect, toggleLikePost);
router.post('/:id/dislike', protect, toggleDislikePost);
router.post('/:id/save', protect, toggleSavePost);

export default router;