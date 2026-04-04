import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';

const toIdString = (value) => value?.toString();

export const buildConversationKey = (a, b) => [toIdString(a), toIdString(b)].sort().join(':');

export const areUsersConnected = async (userId, targetUserId) => {
  const me = await User.findById(userId).select('connections');
  if (!me) return false;
  return me.connections?.some((id) => toIdString(id) === toIdString(targetUserId));
};

export const assertConnected = async (userId, targetUserId) => {
  const ok = await areUsersConnected(userId, targetUserId);
  if (!ok) {
    const error = new Error('You can only chat with your connections');
    error.statusCode = 403;
    throw error;
  }
};

export const sendEncryptedMessage = async ({ senderId, receiverId, ciphertext, iv }) => {
  await assertConnected(senderId, receiverId);

  const senderOid = new mongoose.Types.ObjectId(toIdString(senderId));
  const receiverOid = new mongoose.Types.ObjectId(toIdString(receiverId));
  const conversationKey = buildConversationKey(senderId, receiverId);

  const message = await Message.create({
    conversationKey,
    participants: [senderOid, receiverOid],
    sender: senderOid,
    receiver: receiverOid,
    ciphertext,
    iv,
  });

  return message;
};

export const getConversationMessages = async ({ userId, targetUserId, before, limit = 50 }) => {
  await assertConnected(userId, targetUserId);

  const conversationKey = buildConversationKey(userId, targetUserId);
  const query = { conversationKey };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(safeLimit);

  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  await Message.updateMany(
    { conversationKey, receiver: userOid, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return [...messages].reverse();
};

export const markConversationRead = async ({ userId, targetUserId }) => {
  const conversationKey = buildConversationKey(userId, targetUserId);
  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  await Message.updateMany(
    { conversationKey, receiver: userOid, readAt: null },
    { $set: { readAt: new Date() } }
  );
};

export const getTotalUnreadCount = async (userId) => {
  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  const result = await Message.countDocuments({ receiver: userOid, readAt: null });
  return result;
};

export const getConversationList = async (userId) => {
  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  const userIdStr = toIdString(userId);

  const latestMessages = await Message.find({ participants: userOid })
    .sort({ createdAt: -1 })
    .limit(500)
    .populate('sender', 'fullName username profileImageUri city')
    .populate('receiver', 'fullName username profileImageUri city');

  const seen = new Set();
  const list = [];
  for (const msg of latestMessages) {
    if (seen.has(msg.conversationKey)) continue;
    seen.add(msg.conversationKey);

    const peer = toIdString(msg.sender?._id) === userIdStr ? msg.receiver : msg.sender;
    if (!peer?._id) continue;

    list.push({
      conversationKey: msg.conversationKey,
      peer: {
        _id: peer._id,
        fullName: peer.fullName,
        username: peer.username,
        profileImageUri: peer.profileImageUri || '',
        city: peer.city || '',
      },
      lastMessage: {
        _id: msg._id,
        sender: msg.sender?._id,
        receiver: msg.receiver?._id,
        ciphertext: msg.ciphertext,
        iv: msg.iv,
        createdAt: msg.createdAt,
        readAt: msg.readAt,
      },
    });
  }

  const unreadRows = await Message.aggregate([
    { $match: { receiver: userOid, readAt: null } },
    { $group: { _id: '$conversationKey', count: { $sum: 1 } } },
  ]);

  const unreadMap = {};
  for (const row of unreadRows) {
    unreadMap[row._id] = row.count;
  }

  return list.map((item) => ({
    ...item,
    unreadCount: unreadMap[item.conversationKey] || 0,
  }));
};
