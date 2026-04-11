import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  buildConversationKey,
  markConversationRead,
  sendEncryptedMessage,
} from '../services/chatService.js';
import User from '../models/User.js';

const mapSocketMessage = (message) => ({
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
});

const getTokenFromHandshake = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;
  const raw = socket.handshake?.headers?.authorization || '';
  if (raw.startsWith('Bearer ')) return raw.split(' ')[1];
  return null;
};

export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] },
  });

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
