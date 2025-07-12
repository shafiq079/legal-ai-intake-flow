const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentIntakes, getUpcomingDeadlines } = require('../controllers/dashboardController');

router.get('/stats', getDashboardStats);
router.get('/recent-intakes', getRecentIntakes);
router.get('/upcoming-deadlines', getUpcomingDeadlines);

module.exports = router;
