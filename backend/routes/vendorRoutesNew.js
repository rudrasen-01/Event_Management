const express = require('express');
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  updateVendor,
  getVendor,
  addReview,
  deleteVendor,
  getAllVendors,
  approveVendor,
  rejectVendor
} = require('../controllers/vendorControllerNew');
const { googleLoginVendor } = require('../controllers/googleAuthController');
const inquiryController = require('../controllers/inquiryController');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes

// @route   POST /api/vendors/register
// @desc    Register a new vendor
// @access  Public
router.post('/register', registerVendor);

// Payment Routes

// @route   POST /api/vendors/create-payment-order
// @desc    Create payment order for plan subscription
// @access  Public
router.post('/create-payment-order', paymentController.createPaymentOrder);

// @route   POST /api/vendors/verify-payment
// @desc    Verify payment and activate plan
// @access  Public
router.post('/verify-payment', paymentController.verifyPayment);

// @route   GET /api/vendors/payment-status/:orderId
// @desc    Get payment order status
// @access  Public
router.get('/payment-status/:orderId', paymentController.getPaymentStatus);

// Subscription & Payment Management Routes (Protected)

// @route   GET /api/vendors/my-subscription
// @desc    Get current vendor subscription details
// @access  Private (Vendor)
router.get('/my-subscription', protect, paymentController.getMySubscription);

// @route   GET /api/vendors/payment-history
// @desc    Get vendor's payment history
// @access  Private (Vendor)
router.get('/payment-history', protect, paymentController.getPaymentHistory);

// @route   GET /api/vendors/payment-receipt/:paymentId
// @desc    Generate payment receipt
// @access  Private (Vendor)
router.get('/payment-receipt/:paymentId', protect, paymentController.getPaymentReceipt);

// @route   POST /api/vendors/retry-payment/:orderId
// @desc    Retry a failed payment
// @access  Private (Vendor)
router.post('/retry-payment/:orderId', protect, paymentController.retryPayment);

// @route   POST /api/vendors/upgrade-plan
// @desc    Create payment order for plan upgrade
// @access  Private (Vendor)
router.post('/upgrade-plan', protect, paymentController.createUpgradeOrder);

// @route   POST /api/vendors/login
// @desc    Login vendor
// @access  Public
router.post('/login', loginVendor);

// @route   POST /api/vendors/google-login
// @desc    Google Sign-In for vendors
// @access  Public
router.post('/google-login', googleLoginVendor);

// @route   GET /api/vendors/:vendorId
// @desc    Get vendor profile
// @access  Public
router.get('/:vendorId', getVendor);

// @route   POST /api/vendors/:vendorId/review
// @desc    Add review to vendor
// @access  Public (should be authenticated)
router.post('/:vendorId/review', addReview);

// Vendor Routes (should be protected with auth middleware)

// @route   GET /api/vendors/dashboard/inquiries
// @desc    Get inquiries for logged-in vendor (approved only)
// @access  Private (Vendor)
router.get('/dashboard/inquiries', protect, async (req, res, next) => {
  try {
    // Get vendor MongoDB _id from authenticated user (NOT the custom vendorId string)
    const vendorMongoId = req.user._id;
    
    if (!vendorMongoId) {
      return res.status(401).json({
        success: false,
        message: 'Vendor authentication required'
      });
    }

    console.log('🔍 Authenticated Vendor ID (MongoDB _id):', vendorMongoId);
    console.log('🔍 Vendor custom vendorId:', req.user.vendorId);

    // Pass MongoDB _id as STRING to inquiry controller
    req.params.vendorId = vendorMongoId.toString();
    return inquiryController.getVendorInquiries(req, res, next);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/vendors/:vendorId
// @desc    Update vendor profile
// @access  Private (Vendor)
router.put('/:vendorId', updateVendor);

// @route   DELETE /api/vendors/:vendorId
// @desc    Delete vendor
// @access  Private (Vendor or Admin)
router.delete('/:vendorId', deleteVendor);

// Admin Routes (should be protected with admin auth middleware)

// @route   GET /api/vendors/admin/all
// @desc    Get all vendors (with filters)
// @access  Private (Admin)
router.get('/admin/all', getAllVendors);

// @route   PUT /api/vendors/admin/approve/:vendorId
// @desc    Approve vendor registration
// @access  Private (Admin)
router.put('/admin/approve/:vendorId', approveVendor);

// @route   PUT /api/vendors/admin/reject/:vendorId
// @desc    Reject vendor registration
// @access  Private (Admin)
router.put('/admin/reject/:vendorId', rejectVendor);

module.exports = router;
