import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  company: { type: String, default: '' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notificationsEnabled: { type: Boolean, default: true },
    marketAlertsEnabled: { type: Boolean, default: false },
    defaultWatchlist: { type: [String], default: [] }
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  role: {
    type: String,
    enum: ['user', 'analyst', 'admin'],
    default: 'user',
  },
  profile: {
    type: UserProfileSchema,
    default: () => ({})
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true 
});

const User = mongoose.model('User', UserSchema);

export default User;
