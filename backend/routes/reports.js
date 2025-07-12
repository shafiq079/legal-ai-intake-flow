const express = require('express');
const router = express.Router();
const { getSummaryReports, getCaseAnalytics } = require('../controllers/reportController');

router.get('/summary', getSummaryReports);
router.get('/case-analytics', getCaseAnalytics);

module.exports = router;
