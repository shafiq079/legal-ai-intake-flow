const Joi = require('joi');

/**
 * Validate request data using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    // Replace the original data with the validated (and potentially transformed) data
    req[property] = value;
    next();
  };
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  const schema = Joi.object({
    [paramName]: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': `${paramName} must be a valid MongoDB ObjectId`
    })
  });

  return validate(schema, 'params');
};

/**
 * Pagination validation
 */
const validatePagination = () => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  });

  return validate(schema, 'query');
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),

  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot be longer than 128 characters',
    'any.required': 'Password is required'
  }),

  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),

  name: Joi.string().min(1).max(100).trim().messages({
    'string.min': 'Name cannot be empty',
    'string.max': 'Name cannot be longer than 100 characters'
  }),

  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid MongoDB ObjectId'
  }),

  date: Joi.date().iso().messages({
    'date.format': 'Date must be in ISO format (YYYY-MM-DD)'
  }),

  url: Joi.string().uri().messages({
    'string.uri': 'Must be a valid URL'
  }),

  // Legal-specific schemas
  caseType: Joi.string().valid(
    'immigration', 'criminal', 'civil', 'family', 'business', 
    'personal-injury', 'real-estate', 'other'
  ).messages({
    'any.only': 'Case type must be one of: immigration, criminal, civil, family, business, personal-injury, real-estate, other'
  }),

  priority: Joi.string().valid('low', 'medium', 'high', 'critical').messages({
    'any.only': 'Priority must be one of: low, medium, high, critical'
  }),

  status: Joi.string().valid('intake', 'active', 'pending', 'completed', 'closed').messages({
    'any.only': 'Status must be one of: intake, active, pending, completed, closed'
  }),

  role: Joi.string().valid('admin', 'lawyer', 'assistant', 'paralegal').messages({
    'any.only': 'Role must be one of: admin, lawyer, assistant, paralegal'
  })
};

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

/**
 * Rate limiting validation for sensitive operations
 */
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    while (userAttempts.length > 0 && userAttempts[0] < now - windowMs) {
      userAttempts.shift();
    }

    if (userAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((userAttempts[0] + windowMs - now) / 1000)
      });
    }

    userAttempts.push(now);
    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  validatePagination,
  commonSchemas,
  sanitizeInput,
  sensitiveOperationLimit
};