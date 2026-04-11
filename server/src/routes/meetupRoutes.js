import express from 'express';
import {
  createMeetup,
  deleteMeetup,
  getMeetupById,
  getMeetups,
  getMyMeetups,
  leaveMeetup,
  rsvpMeetup,
  updateMeetup,
} from '../controllers/meetupController.js';
import { protect, requireCompleteProfile } from '../middleware/authMiddleware.js';
import { handleMeetupImageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getMeetups);
router.post('/', protect, requireCompleteProfile, handleMeetupImageUpload, createMeetup);
router.get('/my', protect, getMyMeetups);
router.get('/:id', getMeetupById);
router.put('/:id', protect, updateMeetup);
router.delete('/:id', protect, deleteMeetup);
router.post('/:id/rsvp', protect, rsvpMeetup);
router.delete('/:id/rsvp', protect, leaveMeetup);

export default router;
