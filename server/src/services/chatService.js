import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Block from '../models/Block.js';

const toIdString = (value) => value?.toString();

export const buildConversationKey = (a, b) => [toIdString(a), toIdString(b)].sort().join(':');

export const areUsersConnected = async (userId, targetUserId) => {
  const me = await User.findById(userId).select('connections');
  if (!me) return false;
  return me.connections?.some((id) => toIdString(id) === toIdString(targetUserId));
};

export const isBlocked = async (userA, userB) => {
  const count = await Block.countDocuments({
    $or: [
      { blocker: userA, blocked: userB },
      { blocker: userB, blocked: userA },
    ],
  });
  return count > 0;
};

export const assertConnected = async (userId, targetUserId) => {
  const ok = await areUsersConnected(userId, targetUserId);
  if (!ok) {
    const error = new Error('You can only chat with your connections');
    error.statusCode = 403;
    throw error;
  }
};

export const sendEncryptedMessage = async ({
  senderId,
  receiverId,
  ciphertext,
  iv,
  replyTo = null,
  replySnippet = null,
  messageType = 'text',
  imageUri = null,
  isOneTimeView = false,
}) => {
  if (await isBlocked(senderId, receiverId)) {
    const err = new Error('You cannot message this user');
    err.statusCode = 403;
    throw err;
  }

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
    replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : null,
    replySnippet,
    messageType,
    imageUri,
    isOneTimeView,
  });

  return message;
};

export const viewOneTimeImage = async ({ messageId, userId }) => {
  const message = await Message.findById(messageId);
  if (!message) {
    const error = new Error('Message not found');
    error.statusCode = 404;
    throw error;
  }

  if (toIdString(message.receiver) !== toIdString(userId)) {
    const error = new Error('You are not the recipient of this message');
    error.statusCode = 403;
    throw error;
  }

  if (!message.isOneTimeView || message.messageType !== 'image') {
    const error = new Error('This is not a one-time view image');
    error.statusCode = 400;
    throw error;
  }

  if (message.oneTimeViewedAt) {
    const error = new Error('This image has already been viewed');
    error.statusCode = 410;
    throw error;
  }

  message.oneTimeViewedAt = new Date();
  await message.save();

  return message;
};

export const getConversationMessages = async ({ userId, targetUserId, before, limit = 50 }) => {
  await assertConnected(userId, targetUserId);

  const conversationKey = buildConversationKey(userId, targetUserId);
  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  const query = { conversationKey, deletedFor: { $ne: userOid } };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(safeLimit);

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
  const result = await Message.countDocuments({ 
    receiver: userOid, 
    readAt: null,
    deletedFor: { $ne: userOid }
  });
  return result;
};

export const getConversationList = async (userId) => {
  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  const userIdStr = toIdString(userId);
  const query = { participants: userOid, deletedFor: { $ne: userOid } };

  const [latestMessages, blockedByMe, blockedMe] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('sender', 'fullName username profileImageUri city isOnline lastSeenAt')
      .populate('receiver', 'fullName username profileImageUri city isOnline lastSeenAt'),
    Block.find({ blocker: userOid }).select('blocked').lean(),
    Block.find({ blocked: userOid }).select('blocker').lean(),
  ]);

  const blockedSet = new Set();
  blockedByMe.forEach((b) => blockedSet.add(b.blocked.toString()));
  blockedMe.forEach((b) => blockedSet.add(b.blocker.toString()));

  const seen = new Set();
  const list = [];
  for (const msg of latestMessages) {
    if (seen.has(msg.conversationKey)) continue;
    seen.add(msg.conversationKey);

    const peer = toIdString(msg.sender?._id) === userIdStr ? msg.receiver : msg.sender;
    if (!peer?._id) continue;

    const peerIdStr = toIdString(peer._id);
    const peerBlocked = blockedSet.has(peerIdStr);

    list.push({
      conversationKey: msg.conversationKey,
      isBlocked: peerBlocked,
      peer: peerBlocked
        ? {
            _id: peer._id,
            fullName: 'Unknown User',
            username: 'unknown',
            profileImageUri: '',
            city: '',
            isOnline: false,
            lastSeenAt: null,
          }
        : {
            _id: peer._id,
            fullName: peer.fullName,
            username: peer.username,
            profileImageUri: peer.profileImageUri || '',
            city: peer.city || '',
            isOnline: peer.isOnline,
            lastSeenAt: peer.lastSeenAt,
          },
      lastMessage: {
        _id: msg._id,
        sender: msg.sender?._id,
        receiver: msg.receiver?._id,
        ciphertext: msg.ciphertext,
        iv: msg.iv,
        createdAt: msg.createdAt,
        readAt: msg.readAt,
        messageType: msg.messageType || 'text',
        imageUri: msg.imageUri || null,
        isOneTimeView: msg.isOneTimeView || false,
        oneTimeViewedAt: msg.oneTimeViewedAt || null,
      },
    });
  }

  const unreadRows = await Message.aggregate([
    { $match: { receiver: userOid, readAt: null, deletedFor: { $ne: userOid } } },
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

export const reactToMessage = async ({ messageId, userId, emoji }) => {
  const message = await Message.findById(messageId);
  if (!message) {
    const error = new Error('Message not found');
    error.statusCode = 404;
    throw error;
  }

  const userOid = new mongoose.Types.ObjectId(toIdString(userId));
  const isParticipant = message.participants.some(
    (p) => toIdString(p) === toIdString(userId)
  );
  if (!isParticipant) {
    const error = new Error('You are not a participant in this conversation');
    error.statusCode = 403;
    throw error;
  }

  const existingIdx = message.reactions.findIndex(
    (r) => toIdString(r.userId) === toIdString(userId)
  );

  if (existingIdx !== -1) {
    if (message.reactions[existingIdx].emoji === emoji) {
      message.reactions.splice(existingIdx, 1);
    } else {
      message.reactions[existingIdx].emoji = emoji;
      message.reactions[existingIdx].createdAt = new Date();
    }
  } else {
    message.reactions.push({ userId: userOid, emoji, createdAt: new Date() });
  }

  await message.save();
  return message;
};

export const clearChatForUser = async ({ userId, targetUserId }) => {
  const conversationKey = buildConversationKey(userId, targetUserId);
  const userOid = new mongoose.Types.ObjectId(toIdString(userId));

  await Message.updateMany(
    { conversationKey, deletedFor: { $ne: userOid } },
    { $addToSet: { deletedFor: userOid } }
  );
};
