const express = require('express');
const router = express.Router();
const { getEvents, getDeadlines, createEvent } = require('../controllers/calendarController');

router.get('/events', getEvents);
router.get('/deadlines', getDeadlines);
router.post('/events', createEvent);

module.exports = router;
