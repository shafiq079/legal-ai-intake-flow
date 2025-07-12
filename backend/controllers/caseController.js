const Case = require('../models/Case');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

const getAllCases = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  const cases = await Case.find(query);
  res.json(cases);
});

const getCaseById = asyncHandler(async (req, res) => {
  const case_ = await Case.findById(req.params.id);
  if (!case_) {
    throw new NotFoundError('Case not found');
  }
  res.json(case_);
});

const createCase = asyncHandler(async (req, res) => {
  const newCase = await Case.create(req.body);
  res.status(201).json(newCase);
});

const updateCase = asyncHandler(async (req, res) => {
  const case_ = await Case.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!case_) {
    throw new NotFoundError('Case not found');
  }
  res.json(case_);
});

const deleteCase = asyncHandler(async (req, res) => {
  const case_ = await Case.findByIdAndDelete(req.params.id);
  if (!case_) {
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
