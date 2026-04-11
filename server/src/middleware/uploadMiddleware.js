import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads/profile-images');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `${req.user._id}-${Date.now()}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image uploads are allowed'));
};

export const uploadProfileImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single('profileImage');

export const handleProfileImageUpload = (req, res, next) => {
  uploadProfileImage(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Profile image must be 5MB or smaller' });
      return;
    }

    res.status(400).json({ message: error.message || 'Could not upload profile image' });
  });
};

export const profileImageUploadDir = uploadDir;

// --- Post Image Upload ---
const postUploadDir = path.resolve(__dirname, '../../uploads/post-images');
fs.mkdirSync(postUploadDir, { recursive: true });

const postStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, postUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `post-${req.user._id}-${Date.now()}${safeExt}`);
  },
});

export const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for posts
  fileFilter,
}).single('postImage');

export const handlePostImageUpload = (req, res, next) => {
  uploadPostImage(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Post image must be 2MB or smaller' });
      return;
    }

    res.status(400).json({ message: error.message || 'Could not upload post image' });
  });
};

export const postImageUploadDir = postUploadDir;

// --- Chat Image Upload ---
const chatUploadDir = path.resolve(__dirname, '../../uploads/chat-images');
fs.mkdirSync(chatUploadDir, { recursive: true });

const chatStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, chatUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `chat-${req.user._id}-${Date.now()}${safeExt}`);
  },
});

export const uploadChatImage = multer({
  storage: chatStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
}).single('chatImage');

export const handleChatImageUpload = (req, res, next) => {
  uploadChatImage(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Image must be 2MB or smaller' });
      return;
    }

    res.status(400).json({ message: error.message || 'Could not upload image' });
  });
};

export const chatImageUploadDir = chatUploadDir;
