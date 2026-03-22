import User from '../models/User.js';

const ensureUserCanBeDeleted = async (user) => {
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount <= 1) {
      const error = new Error('Cannot delete the last admin account');
      error.statusCode = 400;
      throw error;
    }
  }
};

export const deleteAccountById = async (userId) => {
  const user = await User.findById(userId);
  await ensureUserCanBeDeleted(user);

  // Keep related-data cleanup centralized here as more domain models become active.
  await User.deleteOne({ _id: userId });

  return {
    deletedUserId: userId,
  };
};
