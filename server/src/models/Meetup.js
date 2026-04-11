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
    maxMembers: {
      type: Number,
      required: true,
      min: 2,
    },
    hometown: {
      type: String,
      trim: true,
      default: '',
    },
    meetupLocation: {
      type: String,
      trim: true,
      default: '',
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
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
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

meetupSchema.index({ status: 1, date: 1 });
meetupSchema.index({ members: 1 });

const Meetup = mongoose.model('Meetup', meetupSchema);
export default Meetup;
