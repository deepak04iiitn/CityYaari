import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema(
  {
    meetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meetup',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ciphertext: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },
    imageUri: {
      type: String,
      default: null,
    },
    isOneTimeView: {
      type: Boolean,
      default: false,
    },
    oneTimeViewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupMessage',
      default: null,
    },
    replySnippet: {
      type: String,
      default: null,
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

groupMessageSchema.index({ meetupId: 1, createdAt: -1 });
groupMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);
export default GroupMessage;
