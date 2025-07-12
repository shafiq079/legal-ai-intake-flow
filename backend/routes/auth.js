const Joi = require('joi');
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate, commonSchemas, sensitiveOperationLimit } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  firstName: commonSchemas.name.required(),
  lastName: commonSchemas.name.required(),
  role: commonSchemas.role.optional()
});

const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password
});

// Routes
router.post('/register', 
  validate(registerSchema),
  authController.register
);

router.post('/login', 
  sensitiveOperationLimit(5, 15 * 60 * 1000),
  validate(loginSchema),
  authController.login
);

router.post('/logout', 
  protect,
  authController.logout
);

router.post('/refresh-token', 
  authController.refreshToken
);

router.post('/forgot-password', 
  sensitiveOperationLimit(3, 60 * 60 * 1000),
  validate({ email: commonSchemas.email }),
  authController.forgotPassword
);

router.post('/reset-password', 
  sensitiveOperationLimit(3, 60 * 60 * 1000),
  authController.resetPassword
);

router.get('/verify-token', 
  protect,
  authController.verifyToken
);

router.get('/profile', 
  protect,
  authController.getProfile
);

router.put('/profile', 
  protect,
  authController.updateProfile
);

module.exports = router;