import User from '../models/User.js';
import generateToken from '../utils/tokenGenerator.js';
import bcrypt from 'bcryptjs';
import {
  deleteAccountById,
  isUserSoftDeleted,
  purgeDeletedUserIfExpired,
} from '../services/accountDeletionService.js';
import jwt from 'jsonwebtoken';

const normalizeSecurityAnswer = (answer = '') => answer.trim().toLowerCase();

const generatePasswordResetToken = (id) => {
  return jwt.sign(
    { id, purpose: 'password-reset' },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '10m' }
  );
};

const buildAuthUserPayload = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  occupationType: user.occupationType,
  country: user.country,
  state: user.state,
  city: user.city,
  role: user.role,
});

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
    country,
    state,
    city,
    securityQuestion,
    securityAnswer,
  } = req.body;

  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    if (!occupationType || !country || !state || !city || !securityQuestion || !securityAnswer) {
      return res.status(400).json({
        message: 'Occupation type, country, state, city, security question, and security answer are required',
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
      country: country.trim(),
      state: state.trim(),
      city: city.trim(),
      password: hashedPassword,
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash: hashedSecurityAnswer,
      role: role || 'user',
    });

    if (user) {
      res.status(201).json({
        ...buildAuthUserPayload(user),
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
    const activeUser = await purgeDeletedUserIfExpired(user);

    if (isUserSoftDeleted(activeUser)) {
      return res.status(403).json({
        message: 'This account is scheduled for permanent deletion and cannot be used to log in',
      });
    }

    if (activeUser && (await bcrypt.compare(password, activeUser.password))) {
      res.json({
        ...buildAuthUserPayload(activeUser),
        token: generateToken(activeUser._id),
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
    res.json(buildAuthUserPayload(user));
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update authenticated user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const { fullName, username, email, occupationType, country, state, city } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : undefined;
    const normalizedUsername = typeof username === 'string' ? username.trim() : undefined;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
    const normalizedOccupationType =
      typeof occupationType === 'string' ? occupationType.trim() : undefined;
    const normalizedCountry = typeof country === 'string' ? country.trim() : undefined;
    const normalizedState = typeof state === 'string' ? state.trim() : undefined;
    const normalizedCity = typeof city === 'string' ? city.trim() : undefined;

    if (
      normalizedFullName === undefined &&
      normalizedUsername === undefined &&
      normalizedEmail === undefined &&
      normalizedOccupationType === undefined &&
      normalizedCountry === undefined &&
      normalizedState === undefined &&
      normalizedCity === undefined
    ) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    if (normalizedFullName !== undefined && !normalizedFullName) {
      return res.status(400).json({ message: 'Full name cannot be empty' });
    }

    if (normalizedUsername !== undefined && !normalizedUsername) {
      return res.status(400).json({ message: 'Username cannot be empty' });
    }

    if (normalizedEmail !== undefined && !normalizedEmail) {
      return res.status(400).json({ message: 'Email cannot be empty' });
    }
    if (normalizedOccupationType !== undefined && !normalizedOccupationType) {
      return res.status(400).json({ message: 'Occupation type cannot be empty' });
    }
    if (
      normalizedOccupationType !== undefined &&
      !['student', 'working_professional'].includes(normalizedOccupationType)
    ) {
      return res.status(400).json({
        message: 'Occupation type must be either student or working_professional',
      });
    }
    if (normalizedCountry !== undefined && !normalizedCountry) {
      return res.status(400).json({ message: 'Country cannot be empty' });
    }
    if (normalizedState !== undefined && !normalizedState) {
      return res.status(400).json({ message: 'State cannot be empty' });
    }
    if (normalizedCity !== undefined && !normalizedCity) {
      return res.status(400).json({ message: 'City cannot be empty' });
    }

    const conflictChecks = [];
    if (normalizedUsername && normalizedUsername !== user.username) {
      conflictChecks.push({ username: normalizedUsername });
    }
    if (normalizedEmail && normalizedEmail !== user.email) {
      conflictChecks.push({ email: normalizedEmail });
    }

    if (conflictChecks.length > 0) {
      const conflictingUser = await User.findOne({
        _id: { $ne: user._id },
        $or: conflictChecks,
      });

      if (conflictingUser) {
        return res.status(400).json({ message: 'Username or email is already in use' });
      }
    }

    if (normalizedFullName !== undefined) {
      user.fullName = normalizedFullName;
    }
    if (normalizedUsername !== undefined) {
      user.username = normalizedUsername;
    }
    if (normalizedEmail !== undefined) {
      user.email = normalizedEmail;
    }
    if (normalizedOccupationType !== undefined) {
      user.occupationType = normalizedOccupationType;
    }
    if (normalizedCountry !== undefined) {
      user.country = normalizedCountry;
    }
    if (normalizedState !== undefined) {
      user.state = normalizedState;
    }
    if (normalizedCity !== undefined) {
      user.city = normalizedCity;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: buildAuthUserPayload(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
      message: 'Account soft-deleted successfully',
      deletedUserId: deletionResult.deletedUserId,
      deletedAt: deletionResult.deletedAt,
      permanentDeletionAt: deletionResult.purgeAt,
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
    const activeUser = await purgeDeletedUserIfExpired(user);

    if (!activeUser) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (isUserSoftDeleted(activeUser)) {
      return res.status(403).json({ message: 'Account is scheduled for permanent deletion' });
    }

    return res.status(200).json({
      identifier: normalizedIdentifier,
      securityQuestion: activeUser.securityQuestion,
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
    const activeUser = await purgeDeletedUserIfExpired(user);

    if (!activeUser) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (isUserSoftDeleted(activeUser)) {
      return res.status(403).json({ message: 'Account is scheduled for permanent deletion' });
    }

    const answerMatches = await bcrypt.compare(
      normalizeSecurityAnswer(securityAnswer),
      activeUser.securityAnswerHash
    );

    if (!answerMatches) {
      return res.status(401).json({ message: 'Incorrect security answer' });
    }

    return res.status(200).json({
      message: 'Security answer verified',
      resetToken: generatePasswordResetToken(activeUser._id),
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
    const activeUser = await purgeDeletedUserIfExpired(user);

    if (!activeUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isUserSoftDeleted(activeUser)) {
      return res.status(403).json({ message: 'Account is scheduled for permanent deletion' });
    }

    const salt = await bcrypt.genSalt(10);
    activeUser.password = await bcrypt.hash(newPassword, salt);
    await activeUser.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Reset token is invalid or expired' });
    }

    return res.status(500).json({ message: error.message });
  }
};
