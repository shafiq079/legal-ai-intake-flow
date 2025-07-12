const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads to memory
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    // Images
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    
    // Documents
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'application/vnd.ms-powerpoint': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    
    // Text files
    'text/plain': true,
    'text/csv': true,
    
    // Other formats
    'application/zip': true,
    'application/x-rar-compressed': true,
    'application/octet-stream': true,

    // Audio formats
    'audio/webm': true,
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/ogg': true,
    'audio/aac': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  }
});

/**
 * Single file upload middleware
 */
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 10MB.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Unexpected field name. Expected '${fieldName}'.`
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add file metadata to request
      if (req.file) {
        req.fileMetadata = {
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        };
      }
      
      next();
    });
  };
};

/**
 * Multiple files upload middleware
 */
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 10MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files.`
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add files metadata to request
      if (req.files && req.files.length > 0) {
        req.filesMetadata = req.files.map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        }));
      }
      
      next();
    });
  };
};

/**
 * Validate file requirements
 */
const validateFileRequirements = (requirements = {}) => {
  return (req, res, next) => {
    const {
      required = false,
      allowedTypes = [],
      maxSize = 10 * 1024 * 1024,
      minSize = 0
    } = requirements;

    // Check if file is required
    if (required && !req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const filesToCheck = req.files || (req.file ? [req.file] : []);

    // Validate each file
    for (const file of filesToCheck) {
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`
        });
      }

      if (file.size < minSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} is too small. Minimum size is ${Math.round(minSize / 1024)}KB`
        });
      }
    }

    next();
  };
};

/**
 * Clean up uploaded files (in case of errors)
 */
const cleanupFiles = (req, res, next) => {
  const fs = require('fs');
  
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    // Only cleanup if there was an error (status >= 400)
    if (res.statusCode >= 400) {
      const filesToCleanup = [];
      
      if (req.file) {
        filesToCleanup.push(req.file.path);
      }
      
      if (req.files) {
        filesToCleanup.push(...req.files.map(file => file.path));
      }
      
      // Cleanup files asynchronously
      filesToCleanup.forEach(filePath => {
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to cleanup file:', filePath, err);
          }
        });
      });
    }
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateFileRequirements,
  cleanupFiles
};
