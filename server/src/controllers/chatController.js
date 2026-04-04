import {
  getConversationList,
  getConversationMessages,
  getTotalUnreadCount,
  markConversationRead,
  sendEncryptedMessage,
} from '../services/chatService.js';

const mapMessage = (msg) => ({
  _id: msg._id,
  sender: msg.sender,
  receiver: msg.receiver,
  ciphertext: msg.ciphertext,
  iv: msg.iv,
  conversationKey: msg.conversationKey,
  readAt: msg.readAt,
  createdAt: msg.createdAt,
});

const withError = (res, error, fallbackMessage) => {
  const status = error?.statusCode || 500;
  return res.status(status).json({
    message: error?.message || fallbackMessage,
  });
};

export const listMyConversations = async (req, res) => {
  try {
    const items = await getConversationList(req.user._id);
    res.json({ conversations: items });
  } catch (error) {
    withError(res, error, 'Failed to fetch conversations');
  }
};

export const listConversationMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { before, limit } = req.query;
    const messages = await getConversationMessages({
      userId: req.user._id,
      targetUserId: userId,
      before,
      limit,
    });

    res.json({ messages: messages.map(mapMessage) });
  } catch (error) {
    withError(res, error, 'Failed to fetch messages');
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ciphertext, iv } = req.body;

    if (!ciphertext || !iv) {
      return res.status(400).json({ message: 'ciphertext and iv are required' });
    }

    const message = await sendEncryptedMessage({
      senderId: req.user._id,
      receiverId: userId,
      ciphertext,
      iv,
    });

    res.status(201).json({ message: mapMessage(message) });
  } catch (error) {
    withError(res, error, 'Failed to send message');
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await getTotalUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    withError(res, error, 'Failed to fetch unread count');
  }
};

export const readConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    await markConversationRead({
      userId: req.user._id,
      targetUserId: userId,
    });
    res.json({ success: true });
  } catch (error) {
    withError(res, error, 'Failed to mark conversation as read');
  }
};