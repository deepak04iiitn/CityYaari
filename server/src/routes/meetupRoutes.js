import express from 'express';
import {
  createMeetup,
  deleteMeetup,
  getMeetups,
  updateMeetup,
} from '../controllers/meetupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getMeetups).post(protect, createMeetup);
router.route('/:id').put(protect, updateMeetup).delete(protect, deleteMeetup);

export default router;