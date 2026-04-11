import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  buildConversationKey,
  markConversationRead,
  sendEncryptedMessage,
  reactToMessage,
} from '../services/chatService.js';
import User from '../models/User.js';
import GroupMessage from '../models/GroupMessage.js';
import Meetup from '../models/Meetup.js';

export const mapSocketMessage = (message) => ({
  _id: message._id,
  sender: message.sender,
  receiver: message.receiver,
  ciphertext: message.ciphertext,
  iv: message.iv,
  conversationKey: message.conversationKey,
  createdAt: message.createdAt,
  readAt: message.readAt,
  replyTo: message.replyTo,
  replySnippet: message.replySnippet,
  messageType: message.messageType || 'text',
  imageUri: message.imageUri || null,
  isOneTimeView: message.isOneTimeView || false,
  oneTimeViewedAt: message.oneTimeViewedAt || null,
  reactions: (message.reactions || []).map((r) => ({
    userId: String(r.userId),
    emoji: r.emoji,
    createdAt: r.createdAt,
  })),
});

const getTokenFromHandshake = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;
  const raw = socket.handshake?.headers?.authorization || '';
  if (raw.startsWith('Bearer ')) return raw.split(' ')[1];
  return null;
};

let ioInstance = null;

export const getIO = () => ioInstance;

export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] },
  });

  ioInstance = io;

  io.use((socket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      if (!token) return next(new Error('Unauthorized: no token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]', err.message);
      next(new Error('Unauthorized: invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[Socket] User connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    // Update status to online
    try {
      await User.findByIdAndUpdate(socket.userId, { isOnline: true });
      io.emit('user:status', { userId: socket.userId, isOnline: true });
    } catch (err) {
      console.error('[Socket Connection Status Error]', err.message);
    }

    socket.on('chat:send', async (payload = {}, callback) => {
      try {
        const { to, ciphertext, iv, clientTempId, replyTo, replySnippet } = payload;
        if (!to || !ciphertext || !iv) {
          throw new Error('to, ciphertext and iv are required');
        }

        const saved = await sendEncryptedMessage({
          senderId: socket.userId,
          receiverId: to,
          ciphertext,
          iv,
          replyTo,
          replySnippet,
        });

        console.log(`[Socket] Message saved: ${saved._id} from ${socket.userId} to ${to}`);

        const eventPayload = {
          message: mapSocketMessage(saved),
          clientTempId: clientTempId || null,
        };

        io.to(`user:${socket.userId}`).emit('chat:message', eventPayload);
        io.to(`user:${to}`).emit('chat:message', eventPayload);

        if (typeof callback === 'function') {
          callback({ success: true, ...eventPayload });
        }
      } catch (error) {
        console.error('[Socket chat:send Error]', error.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: error?.message || 'Failed to send message' });
        }
      }
    });

    socket.on('chat:read', async (payload = {}, callback) => {
      try {
        const { peerUserId } = payload;
        if (!peerUserId) throw new Error('peerUserId is required');

        await markConversationRead({
          userId: socket.userId,
          targetUserId: peerUserId,
        });

        const conversationKey = buildConversationKey(socket.userId, peerUserId);
        const readEvent = {
          conversationKey,
          byUserId: socket.userId,
          at: new Date().toISOString(),
        };
        io.to(`user:${peerUserId}`).emit('chat:read-receipt', readEvent);
        if (typeof callback === 'function') {
          callback({ success: true, ...readEvent });
        }
      } catch (error) {
        console.error('[Socket chat:read Error]', error.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: error?.message || 'Failed to update read state' });
        }
      }
    });

    socket.on('chat:typing', (payload = {}) => {
      const { to, isTyping } = payload;
      if (!to) return;
      io.to(`user:${to}`).emit('chat:typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on('chat:react', async (payload = {}, callback) => {
      try {
        const { messageId, emoji } = payload;
        if (!messageId || !emoji) {
          throw new Error('messageId and emoji are required');
        }

        const updated = await reactToMessage({
          messageId,
          userId: socket.userId,
          emoji,
        });

        const reactPayload = {
          messageId: String(updated._id),
          reactions: updated.reactions.map((r) => ({
            userId: String(r.userId),
            emoji: r.emoji,
            createdAt: r.createdAt,
          })),
        };

        for (const pid of updated.participants) {
          io.to(`user:${String(pid)}`).emit('chat:reaction', reactPayload);
        }

        if (typeof callback === 'function') {
          callback({ success: true, ...reactPayload });
        }
      } catch (error) {
        console.error('[Socket chat:react Error]', error.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: error?.message || 'Failed to react' });
        }
      }
    });

    // ── Group Chat Events ──

    socket.on('group:join', (payload = {}) => {
      const { meetupId } = payload;
      if (!meetupId) return;
      socket.join(`meetup:${meetupId}`);
    });

    socket.on('group:leave', (payload = {}) => {
      const { meetupId } = payload;
      if (!meetupId) return;
      socket.leave(`meetup:${meetupId}`);
    });

    socket.on('group:send', async (payload = {}, callback) => {
      try {
        const { meetupId, ciphertext, iv, replyTo, replySnippet } = payload;
        if (!meetupId || !ciphertext || !iv) {
          throw new Error('meetupId, ciphertext and iv are required');
        }

        const meetup = await Meetup.findById(meetupId);
        if (!meetup) throw new Error('Meetup not found');
        if (!meetup.members.some(m => m.toString() === socket.userId)) {
          throw new Error('Not a member');
        }

        const msg = await GroupMessage.create({
          meetupId,
          sender: socket.userId,
          ciphertext,
          iv,
          replyTo: replyTo || null,
          replySnippet: replySnippet || null,
        });

        const populated = await GroupMessage.findById(msg._id)
          .populate('sender', '_id fullName username profileImageUri');

        const mapped = {
          _id: populated._id,
          meetupId: populated.meetupId,
          sender: populated.sender,
          ciphertext: populated.ciphertext,
          iv: populated.iv,
          messageType: 'text',
          replyTo: populated.replyTo,
          replySnippet: populated.replySnippet,
          reactions: [],
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
        };

        io.to(`meetup:${meetupId}`).emit('group:message', mapped);

        if (typeof callback === 'function') {
          callback({ success: true, message: mapped });
        }
      } catch (error) {
        console.error('[Socket group:send Error]', error.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: error?.message || 'Failed to send' });
        }
      }
    });

    socket.on('group:typing', (payload = {}) => {
      const { meetupId, isTyping } = payload;
      if (!meetupId) return;
      socket.to(`meetup:${meetupId}`).emit('group:typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on('group:react', async (payload = {}, callback) => {
      try {
        const { messageId, emoji } = payload;
        if (!messageId || !emoji) throw new Error('messageId and emoji required');

        const msg = await GroupMessage.findById(messageId);
        if (!msg) throw new Error('Message not found');

        const userId = socket.userId;
        const idx = msg.reactions.findIndex(r => r.userId.toString() === userId);
        if (idx >= 0) {
          if (msg.reactions[idx].emoji === emoji) {
            msg.reactions.splice(idx, 1);
          } else {
            msg.reactions[idx].emoji = emoji;
            msg.reactions[idx].createdAt = new Date();
          }
        } else {
          msg.reactions.push({ userId, emoji });
        }
        await msg.save();

        const reactPayload = {
          messageId: String(msg._id),
          reactions: msg.reactions.map(r => ({
            userId: String(r.userId),
            emoji: r.emoji,
            createdAt: r.createdAt,
          })),
        };

        io.to(`meetup:${msg.meetupId}`).emit('group:reaction', reactPayload);

        if (typeof callback === 'function') {
          callback({ success: true, ...reactPayload });
        }
      } catch (error) {
        console.error('[Socket group:react Error]', error.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: error?.message || 'Failed to react' });
        }
      }
    });

    socket.on('disconnect', async () => {
      console.log(`[Socket] User disconnected: ${socket.userId}`);
      // Update status to offline
      try {
        const lastSeenAt = new Date();
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeenAt });
        io.emit('user:status', { userId: socket.userId, isOnline: false, lastSeenAt });
      } catch (err) {
        console.error('[Socket Disconnect Status Error]', err.message);
      }
    });
  });

  return io;
};
