const Form = require('../models/Form');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

const getAllForms = asyncHandler(async (req, res) => {
  const forms = await Form.find().populate('client', 'name'); // Populate client name
  res.json(forms.map(({ content, ...rest }) => rest)); // Exclude content for list view
});

const getFormById = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id).populate('client', 'name');
  if (!form) {
    throw new NotFoundError('Form not found');
  }
  res.json(form);
});

module.exports = {
  getAllForms,
  getFormById,
};
