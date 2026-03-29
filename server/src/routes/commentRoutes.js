import express from 'express';
import {
  addComment,
  replyToComment,
  getCommentsByPost,
  editComment,
  deleteComment,
  toggleLikeComment,
  toggleDislikeComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', protect, addComment);

router.post('/:id/reply', protect, replyToComment);
router.put('/:id', protect, editComment);
router.delete('/:id', protect, deleteComment);

router.post('/:id/like', protect, toggleLikeComment);
router.post('/:id/dislike', protect, toggleDislikeComment);

export default router;
