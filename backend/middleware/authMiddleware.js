/**
 * Authentication Middleware
 * JWT-based authentication for users and admins
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/VendorNew');

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
      
      console.log('🔐 Token decoded:', { id: decoded.id, role: decoded.role, email: decoded.email });
      
      let user;
      
      // Check if it's a vendor token
      if (decoded.role === 'vendor') {
        user = await Vendor.findById(decoded.id).select('-password');
        if (user) {
          // Convert to plain object and set role
          const userObj = user.toObject();
          userObj.role = 'vendor';
          userObj.vendorId = user.vendorId;
          user = userObj;
          console.log('✅ Vendor authenticated:', { _id: user._id, role: user.role, vendorId: user.vendorId });
        }
      } else {
        // Try to find as regular user
        user = await User.findById(decoded.id).select('-password');
        if (user) {
          console.log('✅ User authenticated:', { _id: user._id, role: user.role });
        }
      }
      
      if (!user) {
        console.error('❌ User/Vendor not found in database for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      // Check if user/vendor is active
      if (user.isActive === false) {
        console.error('❌ Account is inactive for:', user._id);
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your account has been deactivated'
          }
        });
      }
      
      console.log('✅ Auth successful - User attached to request:', { _id: user._id, role: user.role });
      
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

/**
 * Vendor-specific authentication middleware
 * Verifies JWT token and ensures user is a vendor
 */
const vendorProtect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login as a vendor.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      
      // Must be a vendor
      if (decoded.role !== 'vendor') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Vendor role required.'
        });
      }
      
      // Fetch vendor from database
      const vendor = await Vendor.findById(decoded.id).select('-password');
      
      if (!vendor) {
        return res.status(401).json({
          success: false,
          message: 'Vendor not found'
        });
      }
      
      if (!vendor.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your vendor account has been deactivated'
        });
      }
      
      // Attach vendor to request
      req.vendor = vendor;
      req.user = vendor; // Also attach to user for compatibility
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid or expired token.'
      });
    }
    
  } catch (error) {
    console.error('Vendor auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  protect,
  authorize,
  verifyVendorOwnership,
  vendorProtect
};
