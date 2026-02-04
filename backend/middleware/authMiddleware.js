/**
 * Authentication Middleware
 * JWT-based authentication for users and admins
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Not authorized to access this route. Please login.'
        }
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your account has been deactivated'
          }
        });
      }
      
      // Attach user to request
      req.user = user;
      next();
      
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Not authorized. Invalid or expired token.'
        }
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Authentication failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Authorize user roles
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Please login to access this resource'
        }
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `User role '${req.user.role}' is not authorized to access this route`
        }
      });
    }
    
    next();
  };
};

/**
 * Verify vendor ownership
 * Ensure user can only modify their own vendor profile
 */
const verifyVendorOwnership = async (req, res, next) => {
  try {
    // TODO: Implement vendor ownership verification
    // const vendor = await Vendor.findById(req.params.id);
    // if (vendor.userId.toString() !== req.user.id) {
    //   throw new Error('Not authorized');
    // }
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Not authorized to modify this vendor',
      error: error.message
    });
  }
};

module.exports = {
  protect,
  authorize,
  verifyVendorOwnership
};
