const express = require('express');
const router = express.Router();
const { getNotifications, updateNotifications, getSubscription, getTeam } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.get('/notifications', protect, getNotifications);
router.put('/notifications', protect, updateNotifications);
router.get('/subscription', getSubscription);
router.get('/team', getTeam);

module.exports = router;
