import User from '../models/User.js';
import generateToken from '../utils/tokenGenerator.js';
import bcrypt from 'bcryptjs';
import { deleteAccountById } from '../services/accountDeletionService.js';
import jwt from 'jsonwebtoken';

const normalizeSecurityAnswer = (answer = '') => answer.trim().toLowerCase();

const generatePasswordResetToken = (id) => {
  return jwt.sign(
    { id, purpose: 'password-reset' },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '10m' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    role,
    occupationType,
    securityQuestion,
    securityAnswer,
  } = req.body;

  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    if (!occupationType || !securityQuestion || !securityAnswer) {
      return res.status(400).json({
        message: 'Occupation type, security question, and security answer are required',
      });
    }

    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password manually before creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedSecurityAnswer = await bcrypt.hash(normalizeSecurityAnswer(securityAnswer), salt);

    const user = await User.create({
      fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      occupationType,
      password: hashedPassword,
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash: hashedSecurityAnswer,
      role: role || 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        occupationType: user.occupationType,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  try {
    const normalizedIdentifier = identifier?.trim();
    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier?.toLowerCase() },
        { username: normalizedIdentifier },
      ],
    }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        occupationType: user.occupationType,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  res.status(200).json({ message: 'User logged out' });
};


// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      occupationType: user.occupationType,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Delete authenticated user account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteOwnAccount = async (req, res) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const deletionResult = await deleteAccountById(user._id);

    return res.status(200).json({
      message: 'Account deleted successfully',
      deletedUserId: deletionResult.deletedUserId,
      clearAuth: true,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get security question for password recovery
// @route   POST /api/auth/forgot-password/question
// @access  Public
export const getForgotPasswordQuestion = async (req, res) => {
  const { identifier } = req.body;

  try {
    if (!identifier?.trim()) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    const normalizedIdentifier = identifier.trim();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier.toLowerCase() }, { username: normalizedIdentifier }],
    }).select('securityQuestion');

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    return res.status(200).json({
      identifier: normalizedIdentifier,
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Verify security answer for password recovery
// @route   POST /api/auth/forgot-password/verify-answer
// @access  Public
export const verifyForgotPasswordAnswer = async (req, res) => {
  const { identifier, securityAnswer } = req.body;

  try {
    if (!identifier?.trim() || !securityAnswer?.trim()) {
      return res.status(400).json({ message: 'Identifier and security answer are required' });
    }

    const normalizedIdentifier = identifier.trim();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier.toLowerCase() }, { username: normalizedIdentifier }],
    }).select('+securityAnswerHash');

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const answerMatches = await bcrypt.compare(
      normalizeSecurityAnswer(securityAnswer),
      user.securityAnswerHash
    );

    if (!answerMatches) {
      return res.status(401).json({ message: 'Incorrect security answer' });
    }

    return res.status(200).json({
      message: 'Security answer verified',
      resetToken: generatePasswordResetToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using password reset token
// @route   POST /api/auth/forgot-password/reset
// @access  Public
export const resetForgottenPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret123');

    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ message: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Reset token is invalid or expired' });
    }

    return res.status(500).json({ message: error.message });
  }
};
