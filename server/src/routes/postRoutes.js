import express from 'express';
import {
  createPost,
  getPosts,
  toggleLikePost,
  toggleDislikePost,
  toggleSavePost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect, requireCompleteProfile } from '../middleware/authMiddleware.js';
import { handlePostImageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, requireCompleteProfile, handlePostImageUpload, createPost);
router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLikePost);
router.post('/:id/dislike', protect, toggleDislikePost);
router.post('/:id/save', protect, toggleSavePost);

export default router;