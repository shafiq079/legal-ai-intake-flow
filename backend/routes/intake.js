const express = require('express');
const router = express.Router();
const { initiateIntake, getIntakeById, convertIntakeToClient, createIntakeLink, listIntakeLinks, deleteIntakeLink, completeIntake, updateIntakeData, getAllIntakes } = require('../controllers/intakeController');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

router.get('/', asyncHandler(getAllIntakes)); // New route to get all intakes
router.post('/initiate', initiateIntake);
router.post('/create-link', protect, createIntakeLink);
router.get('/links', protect, listIntakeLinks);
router.delete('/links/:linkId', protect, deleteIntakeLink);
router.get('/:id', getIntakeById);
router.post('/:id/convert-to-client', asyncHandler(convertIntakeToClient));
router.post('/:intakeId/complete', asyncHandler(completeIntake));
router.put('/:intakeId/update-data', asyncHandler(updateIntakeData));

module.exports = router;
