const Client = require('../models/Client');
const Case = require('../models/Case');
const Intake = require('../models/Intake');
const Document = require('../models/Document');
const Event = require('../models/Event'); // Import Event model
const { asyncHandler } = require('../middleware/errorHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalClients = await Client.countDocuments();
  const newIntakesThisWeek = await Intake.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    status: 'started',
  });
  const activeCases = await Case.countDocuments({
    status: { $in: ['Open', 'In Progress', 'Under Review'] },
  });
  const pendingDocuments = await Document.countDocuments({ status: 'processing' });

  const stats = [
    {
      title: 'Total Clients',
      value: totalClients,
      description: 'Active clients',
      icon: 'Users',
      trend: { value: 0, isPositive: true }, // Placeholder for actual trend calculation
    },
    {
      title: 'New Intakes',
      value: newIntakesThisWeek,
      description: 'This week',
      icon: 'FileText',
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Active Cases',
      value: activeCases,
      description: 'In progress',
      icon: 'FolderOpen',
      trend: { value: 0, isPositive: false },
    },
    {
      title: 'Pending Documents',
      value: pendingDocuments,
      description: 'Awaiting review',
      icon: 'Clock',
      trend: { value: 0, isPositive: false },
    },
  ];
  res.json(stats);
});

const getRecentIntakes = asyncHandler(async (req, res) => {
  const recentIntakes = await Intake.find({}) // Fetch all intakes
    .sort({ createdAt: -1 }) // Sort by creation date, most recent first
    .populate('clientId', 'personalInfo.firstName personalInfo.lastName'); // Populate clientId and select name fields

  const formattedIntakes = recentIntakes.map(intake => ({
    id: intake._id,
    clientName: intake.clientId
      ? `${intake.clientId.personalInfo.firstName} ${intake.clientId.personalInfo.lastName}`
      : (intake.extractedData?.personalInfo?.firstName && intake.extractedData?.personalInfo?.lastName
          ? `${intake.extractedData.personalInfo.firstName} ${intake.extractedData.personalInfo.lastName}`
          : 'N/A'), // Fallback to N/A if no name in extractedData either
    caseType: intake.extractedData?.caseInfo?.caseType || 'N/A',
    status: intake.status || 'N/A',
    date: intake.createdAt.toISOString().split('T')[0],
    urgency: intake.extractedData?.caseInfo?.urgency || 'N/A',
  }));

  res.json(formattedIntakes);
});

const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const now = new Date();

  // Fetch upcoming case deadlines
  const caseDeadlines = await Case.find({
    "deadlines.date": { $gte: now },
  })
    .populate('clientId', 'personalInfo.firstName personalInfo.lastName')
    .select('title deadlines');

  const formattedCaseDeadlines = caseDeadlines.flatMap(case_ =>
    case_.deadlines
      .filter(deadline => deadline.date >= now)
      .map(deadline => ({
        id: deadline._id,
        title: `${deadline.title} - ${case_.title}`,
        date: deadline.date.toISOString().split('T')[0],
        type: deadline.type || 'Deadline',
        priority: case_.priority || 'Medium',
        clientName: case_.clientId ? `${case_.clientId.personalInfo.firstName} ${case_.clientId.personalInfo.lastName}` : 'N/A',
      }))
  );

  // Fetch upcoming general events
  const generalEvents = await Event.find({
    date: { $gte: now },
  })
    .sort({ date: 1 })
    .limit(10); // Limit to a reasonable number

  const formattedGeneralEvents = generalEvents.map(event => ({
    id: event._id,
    title: event.title,
    date: event.date.toISOString().split('T')[0],
    type: event.type || 'Event',
    priority: 'Medium', // Default priority for general events
    clientName: 'N/A', // General events might not have a client
  }));

  // Combine and sort all upcoming items
  const allUpcomingItems = [...formattedCaseDeadlines, ...formattedGeneralEvents].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  res.json(allUpcomingItems.slice(0, 5)); // Return top 5 combined upcoming items
});

module.exports = {
  getDashboardStats,
  getRecentIntakes,
  getUpcomingDeadlines,
};
