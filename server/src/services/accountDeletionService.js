import User from '../models/User.js';

const SOFT_DELETE_WINDOW_DAYS = 15;

const ensureUserCanBeDeleted = async (user) => {
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isDeleted) {
    const error = new Error('Account is already scheduled for deletion');
    error.statusCode = 400;
    throw error;
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isDeleted: false });

    if (adminCount <= 1) {
      const error = new Error('Cannot delete the last admin account');
      error.statusCode = 400;
      throw error;
    }
  }
};

export const isUserSoftDeleted = (user) => Boolean(user?.isDeleted);

export const purgeDeletedUserIfExpired = async (user) => {
  if (!user?.isDeleted || !user?.purgeAt) {
    return user;
  }

  if (user.purgeAt.getTime() > Date.now()) {
    return user;
  }

  await User.deleteOne({ _id: user._id });
  return null;
};

export const deleteAccountById = async (userId) => {
  const user = await User.findById(userId);
  await ensureUserCanBeDeleted(user);

  const deletedAt = new Date();
  const purgeAt = new Date(deletedAt.getTime() + SOFT_DELETE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  user.isDeleted = true;
  user.deletedAt = deletedAt;
  user.purgeAt = purgeAt;
  await user.save();

  return {
    deletedUserId: userId,
    deletedAt,
    purgeAt,
  };
};
