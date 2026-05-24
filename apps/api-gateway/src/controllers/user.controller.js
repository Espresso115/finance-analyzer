import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(`Get Profile Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { bio, avatarUrl, company, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure profile subdocument exists
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile fields if provided in request body
    if (bio !== undefined) user.profile.bio = bio;
    if (avatarUrl !== undefined) user.profile.avatarUrl = avatarUrl;
    if (company !== undefined) user.profile.company = company;

    if (preferences !== undefined) {
      if (!user.profile.preferences) {
        user.profile.preferences = {};
      }
      if (preferences.theme !== undefined) {
        user.profile.preferences.theme = preferences.theme;
      }
      if (preferences.notificationsEnabled !== undefined) {
        user.profile.preferences.notificationsEnabled = preferences.notificationsEnabled;
      }
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
