const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Assuming you'll create this controller
const { protect } = require('../middleware/auth'); // Assuming you have an auth middleware

router.get('/profile', protect, userController.getProfile);

module.exports = router;
