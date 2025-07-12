const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getProfile,
};
