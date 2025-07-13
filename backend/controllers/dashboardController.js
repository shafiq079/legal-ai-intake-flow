const Client = require('../models/Client');
const Case = require('../models/Case');
const Intake = require('../models/Intake');
const Document = require('../models/Document');
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
  const recentIntakes = await Intake.find({ status: 'started' })
    .sort({ createdAt: -1 })
    .limit(5) // Fetch top 5 recent intakes
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

module.exports = {
  getDashboardStats,
  getRecentIntakes,
  getUpcomingDeadlines,
};
