import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

// Hash a plain text password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare a plain text password with a hash
export const verifyPassword = async (enteredPassword, storedHash) => {
  return await bcrypt.compare(enteredPassword, storedHash);
};

export const validatePasswordStrength = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (/\s/.test(password)) {
    return 'Password must not contain spaces';
  }

  if (!/[A-Za-z]/.test(password)) {
    return 'Password must contain at least one letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  return null;
};

export const generateAccessToken = (user) => {
  const secret = getAccessSecret();
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
  const userId = user?._id || user?.id || user;

  if (!secret) {
    throw new Error('JWT access secret is not defined in environment variables');
  }

  return jwt.sign({ id: userId, role: user?.role, type: 'access' }, secret, {
    expiresIn
  });
};

export const generateRefreshToken = (user) => {
  const secret = getRefreshSecret();
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const userId = user?._id || user?.id || user;

  if (!secret) {
    throw new Error('JWT refresh secret is not defined in environment variables');
  }

  return jwt.sign({ id: userId, type: 'refresh' }, secret, {
    expiresIn
  });
};

export const verifyAccessToken = (token) => {
  const secret = getAccessSecret();
  if (!secret) {
    throw new Error('JWT access secret is not defined in environment variables');
  }

  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token) => {
  const secret = getRefreshSecret();
  if (!secret) {
    throw new Error('JWT refresh secret is not defined in environment variables');
  }

  return jwt.verify(token, secret);
};

// Backward-compatible helper used by earlier Day 4 tests and routes.
export const generateToken = (user) => generateAccessToken(user);
