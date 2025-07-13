const Document = require('../models/Document');
const Intake = require('../models/Intake'); // Import Intake model
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (ensure this is done once, e.g., in config/cloudinary.js and imported)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const detectDocumentType = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('passport')) return 'passport';
  if (name.includes('license') || name.includes('id')) return 'drivers-license';
  if (name.includes('bank') || name.includes('statement')) return 'bank-statement';
  if (name.includes('contract')) return 'contract';
  if (name.includes('birth')) return 'birth-certificate';
  if (name.includes('court') || name.includes('legal')) return 'court-document';
  return 'other';
};

const getDocumentCategory = (docType) => {
  switch (docType) {
    case 'passport':
    case 'drivers-license':
    case 'social-security-card':
      return 'identity';
    case 'birth-certificate':
    case 'marriage-certificate':
    case 'divorce-decree':
      return 'legal';
    case 'tax-return':
    case 'bank-statement':
    case 'pay-stub':
      return 'financial';
    case 'medical-record':
      return 'medical';
    case 'employment-letter':
      return 'employment';
    case 'lease-agreement':
    case 'utility-bill':
      return 'housing';
    case 'court-document':
    case 'contract':
    case 'legal-brief':
    case 'affidavit':
    case 'power-of-attorney':
    case 'will':
      return 'legal';
    default:
      return 'other';
  }
};

const uploadDocument = asyncHandler(async (req, res) => {
  console.log('req.file:', req.file);
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or multer failed to process.' });
  }

  const { documentName, documentType } = req.body; // Get metadata from frontend
  const userId = req.user._id; // Get user ID from authenticated request

  try {
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: `legal-intake/documents`,
      resource_type: "auto",
    });
    console.log('Cloudinary upload result:', result);

    const detectedType = detectDocumentType(req.file.originalname || documentName || 'untitled');
    const detectedCategory = getDocumentCategory(detectedType);

    const docData = {
      name: documentName || req.file.originalname || 'untitled',
      url: result.secure_url,
      type: detectedType,
      category: detectedCategory,
      uploadDate: new Date(),
      status: 'uploaded',
      uploadedBy: userId,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryId: result.public_id,
    };
    console.log('Data for Document.create:', docData);

    const newDoc = await Document.create(docData);

    res.status(200).json({ message: 'Document uploaded successfully', url: result.secure_url, document: newDoc });
  } catch (error) {
    console.error('Error uploading document to Cloudinary:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

const uploadIntakeDocument = asyncHandler(async (req, res) => {
  const { intakeId } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  const intake = await Intake.findOne({ sessionId: intakeId });
  if (!intake) {
    throw new NotFoundError('Intake session not found.');
  }

  const uploadedDocuments = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const documentName = req.body.documentNames[i];
    const documentType = req.body.documentTypes[i];

    try {
      // Upload to Cloudinary using buffer
      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        folder: `legal-intake/${intakeId}`,
        resource_type: "auto",
      });

      const detectedType = detectDocumentType(file.originalname || documentName || 'untitled');
      const detectedCategory = getDocumentCategory(detectedType);

      // Add document reference to the intake session
      const intakeDocumentEntry = {
        name: documentName || file.originalname,
        url: result.secure_url,
        type: detectedType,
        category: detectedCategory,
        uploadDate: new Date(),
        mimeType: file.mimetype,
        fileSize: file.size,
        cloudinaryId: result.public_id,
      };
      intake.documents.push(intakeDocumentEntry);
      console.log('Intake documents after push:', intake.documents);

    } catch (error) {
      console.error('Error uploading document to Cloudinary or saving to DB:', error);
      // Continue processing other files even if one fails
    }
  }

  console.log('Attempting to save intake:', intake);
  await intake.save();
  console.log('Intake saved successfully.');

  res.status(200).json({
    message: 'Documents uploaded and linked to intake successfully.',
    documents: uploadedDocuments,
  });
});

const getAllDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find();
  res.json(documents);
});

const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    throw new NotFoundError('Document not found');
  }
  res.json(document);
});

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  uploadIntakeDocument,
};
