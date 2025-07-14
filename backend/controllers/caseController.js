const Case = require('../models/Case');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
const getAllCases = asyncHandler(async (req, res) => {
  const cases = await Case.find().populate('clientId', 'personalInfo.firstName personalInfo.lastName').populate('assignedLawyer', 'profile.firstName profile.lastName');
  res.json(cases);
});

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id).populate('clientId').populate('assignedLawyer', 'profile.firstName profile.lastName');
  if (!caseRecord) {
    throw new NotFoundError('Case not found');
  }
  res.json(caseRecord);
});

// @desc    Create a case
// @route   POST /api/cases
// @access  Private
const createCase = asyncHandler(async (req, res) => {
  const { clientId, title, description, caseType, priority } = req.body;
  const userId = req.user._id;

  // Generate case number
  const year = new Date().getFullYear();
  const count = await Case.countDocuments({
    createdAt: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1)
    }
  });
  const caseNumber = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;

  const caseRecord = await Case.create({
    clientId,
    title,
    description,
    caseType,
    priority,
    assignedLawyer: userId,
    createdBy: userId,
    caseNumber,
  });
  res.status(201).json(caseRecord);
});

// @desc    Update a case
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!caseRecord) {
    throw new NotFoundError('Case not found');
  }
  res.json(caseRecord);
});

// @desc    Delete a case
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findByIdAndDelete(req.params.id);
  if (!caseRecord) {
    throw new NotFoundError('Case not found');
  }
  res.status(204).send();
});

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
};