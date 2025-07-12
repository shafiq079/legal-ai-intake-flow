const User = require('../models/User');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

let mockSubscription = {
  plan: 'Professional Plan',
  price: '$99/month',
};

let mockTeam = {
  activeUsers: 5,
  availableSeats: 2,
};

const getNotifications = asyncHandler(async (req, res) => {
  // Assuming user ID is available from authentication middleware (req.user._id)
  const user = await User.findById(req.user._id).select('notificationSettings');
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user.notificationSettings);
});

const updateNotifications = asyncHandler(async (req, res) => {
  const { emailNotifications, caseUpdates } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 'notificationSettings.emailNotifications': emailNotifications, 'notificationSettings.caseUpdates': caseUpdates },
    { new: true, runValidators: true }
  ).select('notificationSettings');

  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user.notificationSettings);
});

const getSubscription = (req, res) => {
  res.json(mockSubscription);
};

const getTeam = (req, res) => {
  res.json(mockTeam);
};

module.exports = {
  getNotifications,
  updateNotifications,
  getSubscription,
  getTeam,
};
