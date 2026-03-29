import Comment from '../models/Comment.js';

// @desc    Add a comment to a post
// @route   POST /api/comments/post/:postId
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      content,
      parentComment: null,
    });

    const populatedComment = await comment.populate('user', 'fullName username profileImageUri');
    res.status(201).json({ message: 'Comment added', comment: populatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
export const replyToComment = async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.id);
    if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const comment = await Comment.create({
      post: parentComment.post,
      user: req.user._id,
      content,
      parentComment: parentComment._id,
    });

    const populatedComment = await comment.populate('user', 'fullName username profileImageUri');
    res.status(201).json({ message: 'Reply added', comment: populatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'fullName username profileImageUri')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a comment
// @route   PUT /api/comments/:id
// @access  Private
export const editComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to edit this comment' });
    }

    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - new Date(comment.createdAt).getTime() > tenMinutes) {
      return res.status(403).json({ message: 'Comments can only be edited within 10 minutes of posting' });
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    comment.content = content;
    await comment.save();

    res.json({ message: 'Comment updated', comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    // Optionally delete all nested replies here if cascading delete is required
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Like on a comment
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId.toString());
    }

    await comment.save();
    res.json({ message: hasLiked ? 'Comment unliked' : 'Comment liked', comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Dislike on a comment
// @route   POST /api/comments/:id/dislike
// @access  Private
export const toggleDislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user._id;
    const hasDisliked = comment.dislikes.includes(userId);

    if (hasDisliked) {
      comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId.toString());
    } else {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    }

    await comment.save();
    res.json({ message: hasDisliked ? 'Comment undisliked' : 'Comment disliked', comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
