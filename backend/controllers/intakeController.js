const Intake = require('../models/Intake');
const Client = require('../models/Client');
const IntakeLink = require('../models/IntakeLink');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');
const crypto = require('crypto');

const initiateIntake = asyncHandler(async (req, res) => {
  const sessionId = crypto.randomUUID();
  const newIntake = await Intake.create({ sessionId });
  res.status(201).json({
    success: true,
    message: 'Intake initiated successfully',
    intakeId: newIntake._id,
  });
});

const getIntakeById = asyncHandler(async (req, res) => {
  const { id: linkId } = req.params;

  const intakeLink = await IntakeLink.findOne({ linkId });

  if (!intakeLink) {
    throw new NotFoundError('Intake link not found.');
  }

  // Check if link is expired
  if (intakeLink.expiresAt < new Date()) {
    intakeLink.status = 'expired';
    await intakeLink.save();
    return res.status(410).json({ success: false, message: 'Intake link has expired.' });
  }

  // Check if link is already completed
  if (intakeLink.status === 'completed') {
    // If already completed, return the existing intake data
    const completedIntake = await Intake.findOne({ sessionId: linkId });
    if (completedIntake) {
      return res.status(200).json(completedIntake);
    } else {
      // This case should ideally not happen if link status is completed
      throw new NotFoundError('Completed intake session not found.');
    }
  }

  // Find or create an Intake session associated with this link
  let intake = await Intake.findOne({ sessionId: linkId });

  if (!intake) {
    // If no intake session exists, create a new one
    intake = await Intake.create({
      sessionId: linkId,
      intakeType: intakeLink.type, // Inherit intakeType from IntakeLink
      adminId: intakeLink.createdBy, // Inherit adminId from IntakeLink
      linkStatus: 'active', // Set link status to active
    });
  }

  res.json(intake);
});

const convertIntakeToClient = async (intakeId) => {
  const intake = await Intake.findById(intakeId);
  if (!intake) {
    throw new NotFoundError('Intake session not found');
  }

  if (!intake.extractedData || Object.keys(intake.extractedData).length === 0) {
    throw new Error('No extracted data available to create a client.');
  }

  // Map extracted data to Client model schema
  const clientData = {
    personalInfo: {
      firstName: intake.extractedData.personalInfo?.firstName,
      lastName: intake.extractedData.personalInfo?.lastName,
      email: intake.extractedData.personalInfo?.email,
      phone: intake.extractedData.personalInfo?.phone,
      dateOfBirth: intake.extractedData.personalInfo?.dateOfBirth,
      nationality: intake.extractedData.personalInfo?.nationality,
      maritalStatus: intake.extractedData.personalInfo?.maritalStatus,
      occupation: intake.extractedData.personalInfo?.occupation,
      employer: intake.extractedData.personalInfo?.employer,
    },
    caseInfo: {
      caseType: intake.extractedData.caseInfo?.caseType,
      description: intake.extractedData.caseInfo?.description,
      urgency: intake.extractedData.caseInfo?.urgency,
      desiredOutcome: intake.extractedData.caseInfo?.desiredOutcome,
      previousLegalIssues: intake.extractedData.caseInfo?.previousLegalIssues,
      currentProceedings: intake.extractedData.caseInfo?.currentProceedings,
    },
    immigrationInfo: intake.extractedData.immigrationInfo,
    criminalHistory: intake.extractedData.criminalHistory,
    financialInfo: intake.extractedData.financialInfo,
    documents: intake.documents.map(doc => ({
      name: doc.name,
      url: doc.url || '', // URL might be empty if not yet uploaded to Cloudinary
      type: doc.type || '',
      category: doc.category || '',
      uploadDate: doc.uploadDate || new Date().toISOString(),
    })) || [],
    communicationPreferences: intake.extractedData.communicationPrefs,
    consents: intake.extractedData.consents,
  };

  const newClient = await Client.create(clientData);

  // Update intake status and link to new client
  intake.status = 'converted';
  intake.clientId = newClient._id;
  intake.conversion.isConverted = true;
  intake.conversion.convertedDate = new Date();
  intake.conversion.clientCreated = newClient._id;
  await intake.save();

  return newClient; // Return the created client
};

const markIntakeAsCompleted = asyncHandler(async (intakeId, extractedData) => {
  const intake = await Intake.findOne({ sessionId: intakeId });
  if (!intake) {
    throw new NotFoundError('Intake session not found.');
  }

  // Update intake status and extracted data
  intake.status = 'completed';
  intake.extractedData = extractedData; // Overwrite with the final extracted data from AI
  await intake.save();

  // Update the associated IntakeLink status
  const intakeLink = await IntakeLink.findOne({ linkId: intakeId });
  if (intakeLink) {
    intakeLink.status = 'completed';
    // Optionally, you might want to link the intake to a client here if conversion happens automatically
    // For now, we'll assume client conversion is a separate manual step or triggered elsewhere.
    await intakeLink.save();
  }
});

const completeIntake = asyncHandler(async (req, res) => {
  const { intakeId } = req.params;

  const intake = await Intake.findOne({ sessionId: intakeId });
  if (!intake) {
    throw new NotFoundError('Intake session not found.');
  }

  if (intake.status === 'completed') {
    return res.status(409).json({ message: 'Intake already completed.' });
  }

  // Convert intake to client
  const newClient = await convertIntakeToClient(intake.id); // Use intake.id (Mongoose _id) for convertIntakeToClient

  // Mark intake as completed and save extracted data
  await markIntakeAsCompleted(intake.sessionId, intake.extractedData); // Use the new function

  // Update the associated IntakeLink status
  const intakeLink = await IntakeLink.findOne({ linkId: intakeId });
  if (intakeLink) {
    intakeLink.status = 'completed';
    intakeLink.clientId = newClient._id; // Store the created client's ID
    await intakeLink.save();
  }

  // Set the intake status to 'completed'
  intake.status = 'completed';
  await intake.save();

  res.status(200).json({ message: 'Intake finalized and client created successfully!', clientId: newClient._id });
});

const updateIntakeData = asyncHandler(async (req, res) => {
  const { intakeId } = req.params;
  const formData = req.body; // The complete form data from the frontend

  const intake = await Intake.findOne({ sessionId: intakeId });
  if (!intake) {
    throw new NotFoundError('Intake session not found.');
  }

  // Assign the entire formData to extractedData
  intake.extractedData = formData;

  await intake.save();

  res.status(200).json({ success: true, message: 'Intake data updated successfully!' });
});

const createIntakeLink = asyncHandler(async (req, res) => {
  const { intakeType } = req.body;
  const createdBy = req.user._id; // Assuming req.user is populated by authenticateToken middleware

  if (!intakeType) {
    return res.status(400).json({ success: false, message: 'Intake type is required.' });
  }

  const linkId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Link valid for 7 days

  const newIntakeLink = await IntakeLink.create({
    linkId,
    type: intakeType,
    createdBy,
    expiresAt,
  });

  const publicLinkUrl = `${process.env.FRONTEND_URL}/intake/${newIntakeLink.linkId}`;

  res.status(201).json({
    success: true,
    message: 'Public intake link created successfully',
    linkId: newIntakeLink.linkId,
  });
});

module.exports = {
  initiateIntake,
  getIntakeById,
  convertIntakeToClient: asyncHandler(convertIntakeToClient), // Re-wrap for the route handler
  createIntakeLink,
  listIntakeLinks: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const links = await IntakeLink.find({ createdBy: userId })
      .populate('clientId') // Populate the clientId field to get client details
      .sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  }),
  deleteIntakeLink: asyncHandler(async (req, res) => {
    const { linkId } = req.params;
    const userId = req.user._id;

    const result = await IntakeLink.findOneAndDelete({ linkId, createdBy: userId });

    if (!result) {
      throw new NotFoundError('Intake link not found or you do not have permission to delete it.');
    }

    res.json({ success: true, message: 'Intake link deleted successfully.' });
  }),
  completeIntake,
  updateIntakeData,
  markIntakeAsCompleted, // Export the new function
};

