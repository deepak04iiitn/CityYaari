import Block from '../models/Block.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

// @desc    Block a user
// @route   POST /api/users/:userId/block
// @access  Private
export const blockUser = async (req, res) => {
  try {
    const blockerId = req.user._id;
    const blockedId = req.params.userId;

    if (blockerId.toString() === blockedId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const targetUser = await User.findById(blockedId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await Block.findOne({ blocker: blockerId, blocked: blockedId });
    if (existing) {
      return res.status(409).json({ message: 'User is already blocked' });
    }

    await Block.create({ blocker: blockerId, blocked: blockedId });

    // Remove from each other's connections if connected
    await User.findByIdAndUpdate(blockerId, {
      $pull: {
        connections: blockedId,
        connectionRequestsSent: blockedId,
        connectionRequestsReceived: blockedId,
      },
    });
    await User.findByIdAndUpdate(blockedId, {
      $pull: {
        connections: blockerId,
        connectionRequestsSent: blockerId,
        connectionRequestsReceived: blockerId,
      },
    });

    return res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Unblock a user
// @route   DELETE /api/users/:userId/block
// @access  Private
export const unblockUser = async (req, res) => {
  try {
    const blockerId = req.user._id;
    const blockedId = req.params.userId;

    const result = await Block.findOneAndDelete({ blocker: blockerId, blocked: blockedId });
    if (!result) {
      return res.status(404).json({ message: 'Block not found' });
    }

    return res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get list of users I have blocked
// @route   GET /api/users/me/blocked
// @access  Private
export const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user._id })
      .populate('blocked', '_id username fullName profileImageUri')
      .sort({ createdAt: -1 });

    const users = blocks.map((b) => b.blocked).filter(Boolean);
    return res.json({ blockedUsers: users, count: users.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Report a user
// @route   POST /api/users/:userId/report
// @access  Private
export const reportUser = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const reportedId = req.params.userId;
    const { reason, details } = req.body;

    if (reporterId.toString() === reportedId) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'A reason is required' });
    }

    const targetUser = await User.findById(reportedId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Report.create({
      reporter: reporterId,
      reported: reportedId,
      reason: reason.trim(),
      details: (details || '').trim(),
    });

    return res.json({ message: 'Report submitted successfully. Our team will review it.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Helper: returns Set of user IDs that involve a block relationship with the given user
export const getBlockedIdSet = async (userId) => {
  const [blockedByMe, blockedMe] = await Promise.all([
    Block.find({ blocker: userId }).select('blocked').lean(),
    Block.find({ blocked: userId }).select('blocker').lean(),
  ]);
  const set = new Set();
  blockedByMe.forEach((b) => set.add(b.blocked.toString()));
  blockedMe.forEach((b) => set.add(b.blocker.toString()));
  return set;
};
