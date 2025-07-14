const Notification = require('../models/Notification');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

// @desc    Get notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 });
  res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new NotFoundError('Notification not found or unauthorized');
  }

  res.json(notification);
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete(
    { _id: req.params.id, userId: req.user._id }
  );

  if (!notification) {
    throw new NotFoundError('Notification not found or unauthorized');
  }

  res.status(204).send();
});

// Internal helper to create a notification
const createNotification = async (userId, message, type = 'info', link = null) => {
  try {
    await Notification.create({
      userId,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  createNotification,
};
