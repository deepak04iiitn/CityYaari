import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'connection_request',
        'connection_accepted',
        'post_liked',
        'post_commented',
        'comment_liked',
        'comment_replied',
      ],
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    entityType: {
      type: String,
      enum: ['user', 'post', 'comment'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;