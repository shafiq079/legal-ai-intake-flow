const Event = require('../models/Event');
const Case = require('../models/Case');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');
const { createNotification } = require('./notificationController');

const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

const getDeadlines = asyncHandler(async (req, res) => {
  const upcomingDeadlines = await Case.find({
    dueDate: { $gte: new Date() },
  })
    .sort({ dueDate: 1 })
    .limit(5); // Fetch top 5 upcoming deadlines

  const formattedDeadlines = upcomingDeadlines.map(case_ => ({
    id: case_._id,
    title: `Filing Deadline - ${case_.title}`,
    date: case_.dueDate.toISOString().split('T')[0],
    type: 'Court Filing', // Assuming all deadlines are court filings for now
    priority: case_.priority || 'Medium',
  }));

  res.json(formattedDeadlines);
});

const createEvent = asyncHandler(async (req, res) => {
  const newEvent = await Event.create(req.body);

  // Create a notification for the user who created the event
  await createNotification(
    req.user._id,
    `New event created: ${newEvent.title} on ${newEvent.date.toLocaleDateString()}`,
    'event_reminder',
    '/calendar'
  );

  res.status(201).json(newEvent);
});

module.exports = {
  getEvents,
  getDeadlines,
  createEvent,
};
