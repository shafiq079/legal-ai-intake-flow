const express = require('express');
const router = express.Router();
const { uploadDocument, getAllDocuments, getDocumentById, uploadIntakeDocument } = require('../controllers/documentController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

router.post('/upload', uploadSingle('document'), uploadDocument);
router.post('/upload-intake/:intakeId', uploadMultiple('documents'), uploadIntakeDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

module.exports = router;
