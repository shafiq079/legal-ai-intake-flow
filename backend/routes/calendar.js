const express = require('express');
const router = express.Router();
const { getEvents, getDeadlines, createEvent } = require('../controllers/calendarController');
const { protect: authenticateToken } = require('../middleware/auth');

router.get('/events', authenticateToken, getEvents);
router.get('/deadlines', authenticateToken, getDeadlines);
router.post('/events', authenticateToken, createEvent);

module.exports = router;
