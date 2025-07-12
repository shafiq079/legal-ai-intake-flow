const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(`❌ Error: ${err.message}`);
  console.error(`📍 Stack: ${err.stack}`);
  console.error(`🔗 URL: ${req.method} ${req.originalUrl}`);
  console.error(`👤 User: ${req.user ? req.user.email : 'Anonymous'}`);
  console.error(`🌐 IP: ${req.ip}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Validation Error: ${messages.join(', ')}`;
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = { message, statusCode: 400 };
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 500 };
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timeout';
    error = { message, statusCode: 500 };
  }

  // Cloudinary errors
  if (err.http_code) {
    const message = 'File upload service error';
    error = { message, statusCode: err.http_code };
  }

  // OpenAI API errors
  if (err.type === 'invalid_request_error') {
    const message = 'AI service request error';
    error = { message, statusCode: 400 };
  }

  if (err.type === 'rate_limit_exceeded') {
    const message = 'AI service rate limit exceeded';
    error = { message, statusCode: 429 };
  }

  // Custom application errors
  if (err.name === 'AuthenticationError') {
    error = { message: err.message, statusCode: 401 };
  }

  if (err.name === 'AuthorizationError') {
    error = { message: err.message, statusCode: 403 };
  }

  if (err.name === 'NotFoundError') {
    error = { message: err.message, statusCode: 404 };
  }

  if (err.name === 'ValidationError') {
    error = { message: err.message, statusCode: 400 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Build error response
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  };

  // Add specific error codes for client handling
  if (err.name === 'TokenExpiredError') {
    errorResponse.code = 'TOKEN_EXPIRED';
  }

  if (err.name === 'JsonWebTokenError') {
    errorResponse.code = 'INVALID_TOKEN';
  }

  if (err.code === 11000) {
    errorResponse.code = 'DUPLICATE_RESOURCE';
    errorResponse.field = Object.keys(err.keyValue)[0];
  }

  if (err.name === 'CastError') {
    errorResponse.code = 'INVALID_ID';
  }

  // Rate limiting errors
  if (statusCode === 429) {
    errorResponse.code = 'RATE_LIMIT_EXCEEDED';
    errorResponse.retryAfter = err.retryAfter || 60;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Custom error classes
class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
  asyncHandler
};