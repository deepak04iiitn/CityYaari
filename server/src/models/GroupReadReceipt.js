import mongoose from 'mongoose';

const groupReadReceiptSchema = new mongoose.Schema({
  meetupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meetup',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
});

groupReadReceiptSchema.index({ meetupId: 1, userId: 1 }, { unique: true });

const GroupReadReceipt = mongoose.model('GroupReadReceipt', groupReadReceiptSchema);
export default GroupReadReceipt;
