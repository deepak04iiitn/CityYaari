import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipientId,
  actorId,
  type,
  message,
  entityType,
  entityId,
}) => {
  if (!recipientId || !actorId || !type || !entityType || !entityId) return null;
  if (recipientId.toString() === actorId.toString()) return null;

  try {
    return await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      message: message || '',
      entityType,
      entityId,
    });
  } catch (error) {
    return null;
  }
};