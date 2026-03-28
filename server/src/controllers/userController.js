import User from '../models/User.js';

// @desc    Search users by username or name
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    if (!query) {
      return res.json({ users: [], hasMore: false });
    }

    const keyword = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    };

    // Do not return self in search results
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select('_id fullName username profileImageUri occupationType gender city state country hometownCity hometownState hometownCountry organization studyOrPost bio')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({ ...keyword, _id: { $ne: req.user._id } });
    const hasMore = total > page * limit;

    res.json({ users, hasMore, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('_id fullName username profileImageUri occupationType city state country hometownCity hometownState hometownCountry organization studyOrPost gender bio');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};