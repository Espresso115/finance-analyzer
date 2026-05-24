import fs from 'fs/promises';
import path from 'path';
import ApiKey from '../models/ApiKey.js';
import User from '../models/User.js';
import { generatePlainApiKey, getApiKeyPrefix, hashApiKey } from '../utils/apiKeys.js';
import { hashPassword, validatePasswordStrength, verifyPassword } from '../utils/auth.js';

const serializeUser = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  role: user.role,
  profile: user.profile,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const serializeApiKey = (apiKey) => ({
  id: apiKey._id,
  name: apiKey.name,
  keyPrefix: apiKey.keyPrefix,
  revokedAt: apiKey.revokedAt,
  lastUsedAt: apiKey.lastUsedAt,
  createdAt: apiKey.createdAt
});

const getRequestUserId = (req) => req.user._id.toString();

const canAccessUser = (req, userId) => req.user.role === 'admin' || getRequestUserId(req) === userId;

const applyProfileUpdate = (user, body) => {
  const { bio, avatarUrl, company, preferences } = body;

  if (!user.profile) {
    user.profile = {};
  }

  if (bio !== undefined) user.profile.bio = bio;
  if (avatarUrl !== undefined) user.profile.avatarUrl = avatarUrl;
  if (company !== undefined) user.profile.company = company;

  if (preferences !== undefined) {
    if (!user.profile.preferences) {
      user.profile.preferences = {};
    }

    if (preferences.theme !== undefined) user.profile.preferences.theme = preferences.theme;
    if (preferences.notificationsEnabled !== undefined) {
      user.profile.preferences.notificationsEnabled = preferences.notificationsEnabled;
    }
    if (preferences.marketAlertsEnabled !== undefined) {
      user.profile.preferences.marketAlertsEnabled = preferences.marketAlertsEnabled;
    }
    if (preferences.defaultWatchlist !== undefined) {
      user.profile.preferences.defaultWatchlist = Array.isArray(preferences.defaultWatchlist)
        ? preferences.defaultWatchlist.map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean)
        : user.profile.preferences.defaultWatchlist;
    }
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error(`Get Current User Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving user' });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = getCurrentUser;

export const getUserById = async (req, res) => {
  try {
    if (!canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error(`Get User By ID Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving user' });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    applyProfileUpdate(user, req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(user)
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('profile.preferences');

    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      settings: user.profile.preferences
    });
  } catch (error) {
    console.error(`Get Settings Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    applyProfileUpdate(user, { preferences: req.body });
    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.profile.preferences
    });
  } catch (error) {
    console.error(`Update Settings Error: ${error.message}`);
    res.status(500).json({ error: 'Server error updating settings' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(422).json({ error: passwordError });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPasswordMatches = await verifyPassword(currentPassword, user.passwordHash);
    if (!currentPasswordMatches) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error(`Change Password Error: ${error.message}`);
    res.status(500).json({ error: 'Server error changing password' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Avatar image is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.profile.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: user.profile.avatarUrl,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error(`Upload Avatar Error: ${error.message}`);
    res.status(500).json({ error: 'Server error uploading avatar' });
  }
};

export const listApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      apiKeys: apiKeys.map(serializeApiKey)
    });
  } catch (error) {
    console.error(`List API Keys Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving API keys' });
  }
};

export const createApiKey = async (req, res) => {
  try {
    const name = (req.body.name || 'Default API Key').trim();

    if (name.length < 3) {
      return res.status(422).json({ error: 'API key name must be at least 3 characters' });
    }

    const plainApiKey = generatePlainApiKey();
    const apiKey = await ApiKey.create({
      keyHash: hashApiKey(plainApiKey),
      keyPrefix: getApiKeyPrefix(plainApiKey),
      userId: req.user._id,
      name
    });

    res.status(201).json({
      success: true,
      apiKey: {
        ...serializeApiKey(apiKey),
        key: plainApiKey
      }
    });
  } catch (error) {
    console.error(`Create API Key Error: ${error.message}`);
    res.status(500).json({ error: 'Server error creating API key' });
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: req.params.keyId,
      userId: req.user._id
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    if (!apiKey.revokedAt) {
      apiKey.revokedAt = new Date();
      await apiKey.save();
    }

    res.json({
      success: true,
      message: 'API key revoked successfully',
      apiKey: serializeApiKey(apiKey)
    });
  } catch (error) {
    console.error(`Revoke API Key Error: ${error.message}`);
    res.status(500).json({ error: 'Server error revoking API key' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deletedAt = new Date();
    await user.save();
    await ApiKey.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error(`Delete Account Error: ${error.message}`);
    res.status(500).json({ error: 'Server error deleting account' });
  }
};

export const ensureAvatarUploadDirectory = async (uploadRoot) => {
  await fs.mkdir(path.join(uploadRoot, 'avatars'), { recursive: true });
};
