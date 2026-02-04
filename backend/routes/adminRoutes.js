const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminOnly } = require('../middleware/adminMiddleware');

// All routes protected by adminOnly middleware
router.use(adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Admin
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   PATCH /api/admin/users/:userId
 * @desc    Update user status or role
 * @access  Admin
 */
router.patch('/users/:userId', adminController.updateUserStatus);

/**
 * @route   GET /api/admin/vendors
 * @desc    Get all vendors with filters
 * @access  Admin
 */
router.get('/vendors', adminController.getAllVendors);

/**
 * @route   PATCH /api/admin/vendors/:vendorId/verify
 * @desc    Verify or unverify a vendor
 * @access  Admin
 */
router.patch('/vendors/:vendorId/verify', adminController.toggleVendorVerification);

/**
 * @route   GET /api/admin/inquiries
 * @desc    Get all inquiries from both collections
 * @access  Admin
 */
router.get('/inquiries', adminController.getAllInquiries);

/**
 * @route   PATCH /api/admin/inquiries/:inquiryId
 * @desc    Update inquiry status
 * @access  Admin
 */
router.patch('/inquiries/:inquiryId', adminController.updateInquiryStatus);

module.exports = router;
