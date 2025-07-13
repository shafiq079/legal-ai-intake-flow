const express = require('express');
const router = express.Router();
const { initiateIntake, getIntakeById, convertIntakeToClient, createIntakeLink, listIntakeLinks, deleteIntakeLink, completeIntake, updateIntakeData, getAllIntakes, getSingleIntakeById, deleteIntake, convertIntakeToCase } = require('../controllers/intakeController');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

router.get('/', asyncHandler(getAllIntakes)); // New route to get all intakes
router.post('/initiate', initiateIntake);
router.post('/create-link', protect, createIntakeLink);
router.get('/links', protect, listIntakeLinks);
router.delete('/links/:linkId', protect, deleteIntakeLink);
router.get('/:id', getIntakeById); // This is for public intake links (sessionId)
router.get('/single/:id', asyncHandler(getSingleIntakeById)); // New route to get intake by MongoDB _id
router.post('/:id/convert-to-client', asyncHandler(convertIntakeToClient));
router.post('/:intakeId/complete', asyncHandler(completeIntake));
router.put('/:intakeId/update-data', asyncHandler(updateIntakeData));
router.post('/:id/convert-to-case', protect, asyncHandler(convertIntakeToCase));
router.delete('/:id', asyncHandler(deleteIntake)); // New route to delete intake by MongoDB _id

module.exports = router;
