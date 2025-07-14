const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect: authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.route('/').get(getNotifications);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteNotification);

module.exports = router;
