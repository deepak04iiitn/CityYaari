import mongoose from 'mongoose';

const meetupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      default: 'Meetup',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    imageUri: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const Meetup = mongoose.model('Meetup', meetupSchema);
export default Meetup;