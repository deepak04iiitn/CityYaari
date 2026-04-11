import * as ExpoCrypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

const APP_CHAT_SECRET = process.env.EXPO_PUBLIC_CHAT_E2E_SECRET || 'bandhuu-chat-v1';

const buildConversationSecret = (myUserId, peerUserId) => {
  return [String(myUserId), String(peerUserId)].sort().join(':') + ':' + APP_CHAT_SECRET;
};

const secureRandomWordArray = (byteCount) => {
  const bytes = ExpoCrypto.getRandomBytes(byteCount);
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      ((bytes[i] || 0) << 24) |
      ((bytes[i + 1] || 0) << 16) |
      ((bytes[i + 2] || 0) << 8) |
      (bytes[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, byteCount);
};

export const encryptMessageText = (plainText, myUserId, peerUserId) => {
  const secret = buildConversationSecret(myUserId, peerUserId);
  const key = CryptoJS.SHA256(secret);
  const iv = secureRandomWordArray(16);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });

  return {
    ciphertext: encrypted.toString(),
    iv: CryptoJS.enc.Base64.stringify(iv),
  };
};

export const decryptMessageText = (ciphertext, ivBase64, myUserId, peerUserId) => {
  try {
    const secret = buildConversationSecret(myUserId, peerUserId);
    const key = CryptoJS.SHA256(secret);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, { iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (_error) {
    return '';
  }
};

// ── Group Chat Encryption (meetupId-based shared key) ──

const buildGroupSecret = (meetupId) => {
  return `meetup:${String(meetupId)}:${APP_CHAT_SECRET}`;
};

export const encryptGroupMessage = (plainText, meetupId) => {
  const secret = buildGroupSecret(meetupId);
  const key = CryptoJS.SHA256(secret);
  const iv = secureRandomWordArray(16);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });

  return {
    ciphertext: encrypted.toString(),
    iv: CryptoJS.enc.Base64.stringify(iv),
  };
};

export const decryptGroupMessage = (ciphertext, ivBase64, meetupId) => {
  try {
    const secret = buildGroupSecret(meetupId);
    const key = CryptoJS.SHA256(secret);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, { iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (_error) {
    return '';
  }
};
