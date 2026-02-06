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
 * @route   PATCH /api/admin/vendors/:vendorId/status
 * @desc    Toggle vendor active status (hide/show)
 * @access  Admin
 */
router.patch('/vendors/:vendorId/status', adminController.toggleVendorStatus);

/**
 * @route   DELETE /api/admin/vendors/:vendorId
 * @desc    Permanently delete a vendor
 * @access  Admin
 */
router.delete('/vendors/:vendorId', adminController.deleteVendor);

/**
 * @route   GET /api/admin/activity
 * @desc    Get recent activity (vendors, inquiries, users)
 * @access  Admin
 */
router.get('/activity', adminController.getRecentActivity);

/**
 * @route   GET /api/admin/inquiries/pending
 * @desc    Get all pending inquiries awaiting approval
 * @access  Admin
 */
router.get('/inquiries/pending', adminController.getPendingInquiries);

/**
 * @route   GET /api/admin/inquiries/approval-stats
 * @desc    Get inquiry approval statistics
 * @access  Admin
 */
router.get('/inquiries/approval-stats', adminController.getInquiryApprovalStats);

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

/**
 * @route   POST /api/admin/inquiries/:inquiryId/approve
 * @desc    Approve an inquiry (allows vendor to see it)
 * @access  Admin
 */
router.post('/inquiries/:inquiryId/approve', adminController.approveInquiry);

/**
 * @route   POST /api/admin/inquiries/:inquiryId/reject
 * @desc    Reject an inquiry with reason (vendor won't see it)
 * @access  Admin
 */
router.post('/inquiries/:inquiryId/reject', adminController.rejectInquiry);

/**
 * @route   POST /api/admin/inquiries/:inquiryId/forward
 * @desc    Forward inquiry to a different vendor
 * @access  Admin
 */
router.post('/inquiries/:inquiryId/forward', adminController.forwardInquiry);

/**
 * @route   PATCH /api/admin/inquiries/:inquiryId/toggle-active
 * @desc    Mark inquiry as active/inactive
 * @access  Admin
 */
router.patch('/inquiries/:inquiryId/toggle-active', adminController.toggleInquiryActive);

module.exports = router;
