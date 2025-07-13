const express = require('express');
const router = express.Router();
const { processAIIntake, processVoiceIntake } = require('../controllers/aiController');
const { uploadSingle } = require('../middleware/upload');

router.post('/intake', processAIIntake);
router.post('/voice-intake', processVoiceIntake);

module.exports = router;
