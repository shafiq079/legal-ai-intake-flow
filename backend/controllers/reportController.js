const Client = require('../models/Client');
const Case = require('../models/Case');
const Intake = require('../models/Intake');
const Document = require('../models/Document');
const { asyncHandler } = require('../middleware/errorHandler');

const getSummaryReports = asyncHandler(async (req, res) => {
  const totalClients = await Client.countDocuments();
  const newIntakesLast30Days = await Intake.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });
  const completedCases = await Case.countDocuments({ status: 'Completed' });
  const totalCases = await Case.countDocuments();
  const caseResolutionRate = totalCases > 0 ? ((completedCases / totalCases) * 100).toFixed(2) : '0';

  const summary = {
    clientGrowth: {
      value: `+${newIntakesLast30Days}`,
      period: 'new intakes last 30 days',
    },
    caseResolution: {
      value: `${caseResolutionRate}%`,
      description: 'Success rate',
    },
    revenue: {
      value: '$45,230', // Still mock for now
      period: 'This month',
    },
  };
  res.json(summary);
});

const getCaseAnalytics = asyncHandler(async (req, res) => {
  const analyticsData = await Case.aggregate([
    { $group: { _id: '$caseType', cases: { $sum: 1 } } },
    { $project: { name: '$_id', cases: 1, _id: 0 } },
    { $sort: { cases: -1 } },
  ]);
  res.json(analyticsData);
});

module.exports = {
  getSummaryReports,
  getCaseAnalytics,
};
