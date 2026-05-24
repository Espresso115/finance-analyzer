import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
  verifyRefreshToken
} from '../utils/auth.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const serializeUser = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  role: user.role
});

const buildAuthPayload = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    success: true,
    token: accessToken,
    accessToken,
    refreshToken,
    user: serializeUser(user)
  };
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Please provide email, username and password' });
    }

    if (!emailPattern.test(email)) {
      return res.status(422).json({ error: 'Please provide a valid email address' });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(422).json({ error: passwordError });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      username,
      passwordHash
    });

    res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    if (error.code === 11000) {
      // Caught a duplicate key error from MongoDB (race condition)
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message });
    }
    console.error(`Registration error: ${error.message}`);
    res.status(500).json({ error: 'Server Error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json(buildAuthPayload(user));
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ error: 'Server Error during login' });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type && decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error(`Refresh token error: ${error.message}`);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
