import Post from '../models/Post.js';
import path from 'path';
import fs from 'fs';
import { postImageUploadDir } from '../middleware/uploadMiddleware.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { category, title, details } = req.body;

    if (!category || !title || !details) {
      return res.status(400).json({ message: 'Category, title, and details are required' });
    }

    let imageUri = '';
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUri = `${baseUrl}/uploads/post-images/${req.file.filename}`;
    }

    const post = await Post.create({
      user: req.user._id,
      category,
      title,
      details,
      imageUri,
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'fullName username profileImageUri').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};