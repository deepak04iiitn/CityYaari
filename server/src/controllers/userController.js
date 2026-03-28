import User from '../models/User.js';

// @desc    Search users by username or name
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.json([]);
    }

    const keyword = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    };

    // Do not return self in search results
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select('_id fullName username profileImageUri occupationType gender city state country hometownCity hometownState hometownCountry organization studyOrPost')
      .limit(20);

    res.json(users);
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
      .select('_id fullName username profileImageUri occupationType city state country hometownCity hometownState hometownCountry organization studyOrPost gender');

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