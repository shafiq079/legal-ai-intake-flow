const Client = require('../models/Client');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

const getAllClients = asyncHandler(async (req, res) => {
  const { search, status, caseType } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { caseType: { $regex: search, $options: 'i' } },
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (caseType && caseType !== 'all') {
    query.caseType = caseType;
  }

  const clients = await Client.find(query);
  res.json(clients);
});

const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  res.json(client);
});

const createClient = asyncHandler(async (req, res) => {
  const newClient = await Client.create(req.body);
  res.status(201).json(newClient);
});

const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  res.json(client);
});

const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  res.status(204).send();
});

const submitIntakeForm = asyncHandler(async (req, res) => {
  const intakeData = req.body;

  // In a real application, you would perform extensive validation here
  // using a library like Joi or express-validator, matching the Zod schema
  // used on the frontend.

  // For now, we'll directly create a client from the intake data.
  // You might need to map the intakeData structure to your Client model structure
  // if they are not identical.
  const newClient = await Client.create(intakeData);
  res.status(201).json(newClient);
});

const getClientList = asyncHandler(async (req, res) => {
  const clients = await Client.find({}, 'personalInfo.firstName personalInfo.lastName');
  const clientList = clients.map(client => ({
    value: client._id,
    label: `${client.personalInfo.firstName} ${client.personalInfo.lastName}`,
  }));
  res.json(clientList);
});

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  submitIntakeForm,
  getClientList,
};
