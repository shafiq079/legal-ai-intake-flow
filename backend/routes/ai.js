const express = require('express');
const router = express.Router();
const { processAIIntake, transcribeAudio } = require('../controllers/aiController');
const { uploadSingle } = require('../middleware/upload');

router.post('/intake', processAIIntake);
router.post('/transcribe', uploadSingle('audio'), transcribeAudio);

module.exports = router;
