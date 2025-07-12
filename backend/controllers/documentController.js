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
  if (name.includes('passport')) return 'Passport';
  if (name.includes('license') || name.includes('id')) return 'ID Document';
  if (name.includes('bank') || name.includes('statement')) return 'Bank Statement';
  if (name.includes('contract')) return 'Legal Contract';
  if (name.includes('birth')) return 'Birth Certificate';
  return 'Legal Document';
};

const generateMockExtractedData = (filename) => {
  const base = {
    'Document Type': detectDocumentType(filename),
    'Processing Date': new Date().toLocaleDateString(),
  };

  if (filename.toLowerCase().includes('passport')) {
    return {
      ...base,
      'Full Name': 'Sample Name',
      'Document Number': 'ABC123456',
      'Nationality': 'Unknown',
      'Issue Date': '2020-01-01',
      'Expiry Date': '2030-01-01',
    };
  }

  return {
    ...base,
    'Content': 'Document content extracted successfully',
    'Key Information': 'Various data points identified',
  };
};

const uploadDocument = asyncHandler(async (req, res) => {
  // In a real application, you would handle file storage here (e.g., Cloudinary, S3)
  // For now, we'll simulate the upload and processing
  const { name, size, type } = req.body; // Assuming these come from frontend for simplicity

  const newDoc = await Document.create({
    name: name || 'uploaded-document.pdf',
    size: size || '0 MB',
    type: type || 'Unknown',
    uploadDate: new Date(),
    status: 'processing',
  });

  // Simulate processing completion after a delay
  setTimeout(async () => {
    await Document.findByIdAndUpdate(
      newDoc._id,
      {
        status: 'completed',
        type: detectDocumentType(newDoc.name),
        extractedData: generateMockExtractedData(newDoc.name),
        confidence: 0.85 + Math.random() * 0.15,
        category: 'General',
      },
      { new: true }
    );
  }, 3000 + Math.random() * 2000);

  res.status(202).json(newDoc); // 202 Accepted for processing
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

  for (const file of req.files) {
    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `legal-intake/${intakeId}`,
        resource_type: "auto",
      });

      const newDocument = await Document.create({
        name: file.originalname,
        url: result.secure_url,
        type: detectDocumentType(file.originalname),
        category: 'Intake Document',
        uploadDate: new Date(),
        intakeId: intake._id, // Link to the intake session
      });
      uploadedDocuments.push(newDocument);

      // Add document reference to the intake session
      intake.documents.push({
        name: newDocument.name,
        url: newDocument.url,
        type: newDocument.type,
        category: newDocument.category,
        uploadDate: newDocument.uploadDate,
      });

    } catch (error) {
      console.error('Error uploading document to Cloudinary or saving to DB:', error);
      // Continue processing other files even if one fails
    }
  }

  await intake.save();

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
