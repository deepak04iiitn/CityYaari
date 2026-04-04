import { io } from 'socket.io-client';
import apiClient from '../api/apiClient';

const getSocketBaseUrl = () => {
  const apiBase = apiClient?.defaults?.baseURL || '';
  return apiBase.replace(/\/api\/?$/, '');
};

export const fetchConversations = async () => {
  const response = await apiClient.get('/chats/conversations');
  return response.data?.conversations || [];
};

export const fetchMessages = async (userId, { before, limit } = {}) => {
  const params = {};
  if (before) params.before = before;
  if (limit) params.limit = limit;
  const response = await apiClient.get(`/chats/${userId}/messages`, { params });
  return response.data?.messages || [];
};

export const markConversationRead = async (userId) => {
  await apiClient.put(`/chats/${userId}/read`);
};

export const sendEncryptedMessageHttp = async (userId, payload) => {
  const response = await apiClient.post(`/chats/${userId}/messages`, payload);
  return response.data?.message;
};

export const fetchUnreadMessageCount = async () => {
  const response = await apiClient.get('/chats/unread-count');
  return response.data?.count || 0;
};

let socketRef = null;
let activeToken = null;
let messageHandler = null;
let readReceiptHandler = null;

export const ensureChatSocket = (token) => {
  if (!token) return null;

  if (socketRef && activeToken === token) {
    return socketRef;
  }

  if (socketRef) {
    socketRef.removeAllListeners();
    socketRef.disconnect();
    socketRef = null;
  }

  activeToken = token;

  socketRef = io(getSocketBaseUrl(), {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socketRef.on('connect', () => {});

  socketRef.on('disconnect', () => {});

  socketRef.on('connect_error', () => {});

  socketRef.on('chat:message', (payload) => {
    messageHandler?.(payload);
  });

  socketRef.on('chat:read-receipt', (payload) => {
    readReceiptHandler?.(payload);
  });

  return socketRef;
};

export const setChatHandlers = (onMessage, onReadReceipt) => {
  messageHandler = onMessage;
  readReceiptHandler = onReadReceipt;
};

export const getChatSocket = () => socketRef;

export const destroyChatSocket = () => {
  if (socketRef) {
    socketRef.removeAllListeners();
    socketRef.disconnect();
    socketRef = null;
  }
  activeToken = null;
  messageHandler = null;
  readReceiptHandler = null;
};
