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
