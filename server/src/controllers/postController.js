import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
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
    
    // Add comment counts dynamically
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const count = await Comment.countDocuments({ post: post._id });
        return {
          ...post.toJSON(),
          comments: count
        };
      })
    );

    res.json(postsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Like on a post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Remove like
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Add like and remove dislike if present
      post.likes.push(userId);
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId.toString());
    }

    await post.save();
    res.json({ message: hasLiked ? 'Post unliked' : 'Post liked', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Dislike on a post
// @route   POST /api/posts/:id/dislike
// @access  Private
export const toggleDislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const hasDisliked = post.dislikes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Add dislike and remove like if present
      post.dislikes.push(userId);
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    }

    await post.save();
    res.json({ message: hasDisliked ? 'Post undisliked' : 'Post disliked', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Save on a post
// @route   POST /api/posts/:id/save
// @access  Private
export const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const hasSaved = post.savedBy.includes(userId);

    if (hasSaved) {
      // Remove save
      post.savedBy = post.savedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      // Add save
      post.savedBy.push(userId);
    }

    await post.save();
    res.json({ message: hasSaved ? 'Post unsaved' : 'Post saved', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};