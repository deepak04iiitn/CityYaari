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
    const { q, category, hasImage, sortBy, from, to, gender, hometown, location } = req.query;

    // 1. Initial Match (Post-level filters)
    const matchStage = {};

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      matchStage.$or = [{ title: regex }, { details: regex }];
    }

    if (category && category.trim()) {
      const cats = category.split(',').map((c) => c.trim()).filter(Boolean);
      matchStage.category = { $in: cats.map((c) => new RegExp(`^${c}$`, 'i')) };
    }

    if (hasImage === 'true') matchStage.imageUri = { $nin: [null, ''] };
    if (hasImage === 'false') matchStage.$or = [
      ...(matchStage.$or || []),
      { imageUri: null },
      { imageUri: '' },
      { imageUri: { $exists: false } },
    ];

    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to)   matchStage.createdAt.$lte = new Date(to);
    }

    // 2. Start Pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
    ];

    // 3. Match Author Filters
    const authorMatch = {};
    if (gender) {
      authorMatch['author.gender'] = gender;
    }
    if (hometown && hometown.trim()) {
      authorMatch['author.hometownCity'] = new RegExp(hometown.trim(), 'i');
    }
    if (location && location.trim()) {
      authorMatch['author.city'] = new RegExp(location.trim(), 'i');
    }

    if (Object.keys(authorMatch).length > 0) {
      pipeline.push({ $match: authorMatch });
    }

    // 4. Sort and Count Fields
    pipeline.push({
      $addFields: {
        likesCount: { $size: { $ifNull: ['$likes', []] } },
        dislikesCount: { $size: { $ifNull: ['$dislikes', []] } },
      },
    });

    let sort = { createdAt: -1 };
    if (sortBy === 'top_liked')    sort = { likesCount: -1 };
    if (sortBy === 'top_disliked') sort = { dislikesCount: -1 };
    if (sortBy === 'oldest')       sort = { createdAt: 1 };

    pipeline.push({ $sort: sort });

    // 5. Final Projection (to match expected post structure)
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        details: 1,
        category: 1,
        imageUri: 1,
        likes: 1,
        dislikes: 1,
        savedBy: 1,
        createdAt: 1,
        updatedAt: 1,
        user: {
          _id: '$author._id',
          fullName: '$author.fullName',
          username: '$author.username',
          profileImageUri: '$author.profileImageUri',
        },
      },
    });

    const posts = await Post.aggregate(pipeline);

    // 6. Add comment counts
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const count = await Comment.countDocuments({ post: post._id });
        return { ...post, comments: count };
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