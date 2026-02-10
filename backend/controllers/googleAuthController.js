const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Vendor = require('../models/VendorNew');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Verify Google ID token
 * @param   {string} token - Google ID token from frontend
 * @returns {object} Verified payload with email, name, picture
 */
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    // Verify email is verified by Google
    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }
    
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('❌ Google token verification failed:', error.message);
    throw new Error('Invalid Google token');
  }
}

/**
 * @desc    Google Sign-In for Users (including Admin)
 * @route   POST /api/users/google-login
 * @access  Public
 */
exports.googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Google ID token is required'
        }
      });
    }
    
    // Verify Google token
    const googleUser = await verifyGoogleToken(token);
    
    // Check if user exists with this email
    const user = await User.findOne({ email: googleUser.email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email. Please register first.'
        }
      });
    }
    
    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated. Please contact support.'
        }
      });
    }
    
    // Update email verification status if not already verified
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }
    
    // Update last login and profile image if not set
    user.lastLogin = new Date();
    if (!user.profileImage && googleUser.picture) {
      user.profileImage = googleUser.picture;
    }
    await user.save();
    
    // Generate JWT token (same as regular login)
    const authToken = user.generateAuthToken();
    
    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token: authToken
      },
      message: 'Google login successful'
    });
    
  } catch (error) {
    console.error('❌ Google login error:', error);
    
    if (error.message === 'Invalid Google token') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid Google authentication. Please try again.'
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Google login failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Google Sign-In for Vendors
 * @route   POST /api/vendors/google-login
 * @access  Public
 */
exports.googleLoginVendor = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Google ID token is required'
        }
      });
    }
    
    // Verify Google token
    const googleUser = await verifyGoogleToken(token);
    
    // Check if vendor exists with this email
    const vendor = await Vendor.findOne({ 'contact.email': googleUser.email.toLowerCase() });
    
    if (!vendor) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'No vendor account found with this email. Please register first.'
        }
      });
    }
    
    // Check if vendor is active (admin must activate after registration)
    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_PENDING_APPROVAL',
          message: 'Your account is pending admin approval. You will be able to login once activated by admin.'
        }
      });
    }
    
    // Update email verification status
    if (!vendor.contact.emailVerified) {
      vendor.contact.emailVerified = true;
    }
    
    // Update profile image if not set
    if (!vendor.images?.logo && googleUser.picture) {
      if (!vendor.images) vendor.images = {};
      vendor.images.logo = googleUser.picture;
    }
    
    await vendor.save();
    
    // Generate JWT token (same as regular vendor login)
    const authToken = vendor.generateAuthToken();
    
    res.status(200).json({
      success: true,
      token: authToken,
      data: {
        vendorId: vendor.vendorId,
        _id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName,
        email: vendor.contact.email,
        phone: vendor.contact.phone,
        serviceType: vendor.serviceType,
        city: vendor.city,
        verified: vendor.verified,
        isActive: vendor.isActive,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        role: 'vendor'
      },
      message: 'Google login successful'
    });
    
  } catch (error) {
    console.error('❌ Vendor Google login error:', error);
    
    if (error.message === 'Invalid Google token') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid Google authentication. Please try again.'
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Google login failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
