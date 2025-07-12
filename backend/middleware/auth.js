const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyAccessToken } = require('../config/jwt');

/**
 * Verify JWT token middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

/**
 * Check user role permissions
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Check specific permissions
 * @param {string} permission - Permission to check
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Check if user can access specific client
 * @param {string} clientIdParam - Parameter name containing client ID
 */
const canAccessClient = (clientIdParam = 'clientId') => {
  return async (req, res, next) => {
    try {
      const clientId = req.params[clientIdParam] || req.body[clientIdParam];
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Admin and lawyers can access all clients
      if (req.user.role === 'admin' || req.user.role === 'lawyer') {
        return next();
      }

      // For other roles, check if they have specific access
      // This would typically involve checking if they're assigned to the client
      // For now, we'll allow access for assistants and paralegals
      if (req.user.role === 'assistant' || req.user.role === 'paralegal') {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied to this client'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking client access',
        error: error.message
      });
    }
  };
};

module.exports = {
  protect: authenticateToken,
  authorizeRoles,
  checkPermission,
  optionalAuth,
  canAccessClient
};