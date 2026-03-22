import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteOwnAccount,
  getForgotPasswordQuestion,
  verifyForgotPasswordAnswer,
  resetForgottenPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password/question', getForgotPasswordQuestion);
router.post('/forgot-password/verify-answer', verifyForgotPasswordAnswer);
router.post('/forgot-password/reset', resetForgottenPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/account', protect, deleteOwnAccount);

export default router;
