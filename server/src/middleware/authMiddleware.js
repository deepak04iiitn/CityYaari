import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isUserSoftDeleted, purgeDeletedUserIfExpired } from '../services/accountDeletionService.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      req.user = await purgeDeletedUserIfExpired(req.user);

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (isUserSoftDeleted(req.user)) {
        return res.status(401).json({ message: 'Account is scheduled for permanent deletion' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Require complete profile (hometown, current location, organization, bio)
export const requireCompleteProfile = (req, res, next) => {
  const u = req.user;
  if (!u?.hometownCountry || !u?.country || !u?.organization || !u?.bio) {
    return res.status(403).json({
      message: 'Please complete your profile before performing this action.',
      code: 'PROFILE_INCOMPLETE',
    });
  }
  next();
};
