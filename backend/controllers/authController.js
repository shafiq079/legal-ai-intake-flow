const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { asyncHandler, AuthenticationError, ValidationError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Register new user
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create new user
  const user = new User({
    email,
    password,
    role: role || 'lawyer',
    profile: { firstName, lastName }
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokens(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicData(),
      ...tokens
    }
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AuthenticationError('User not found. Please sign up.');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password.');
  }

  // Update last login
  await user.updateLastLogin();

  // Generate tokens
  const tokens = generateTokens(user);

  console.log('Login successful, sending response:', { user: user.getPublicData(), ...tokens });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicData(),
      ...tokens
    }
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    });
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'If email exists, reset instructions have been sent'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // In production, send email with reset link
  // For now, return the token (for development)
  res.json({
    success: true,
    message: 'Password reset instructions sent to email',
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

// Verify token
const verifyToken = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, specialization, department } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        'profile.firstName': firstName,
        'profile.lastName': lastName,
        'profile.phone': phone,
        'profile.specialization': specialization,
        'profile.department': department,
        updatedAt: Date.now()
      }
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicData()
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyToken,
  getProfile,
  updateProfile
};