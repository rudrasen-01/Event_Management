const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const keywordController = require('../controllers/keywordController');
const blogController = require('../controllers/blogController');
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
 * @route   GET /api/admin/vendors/:vendorId
 * @desc    Get single vendor by ID (includes inactive)
 * @access  Admin
 */
router.get('/vendors/:vendorId', adminController.getVendorById);

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

// ====================================
// SERVICE KEYWORDS MANAGEMENT
// ====================================

/**
 * @route   GET /api/admin/keywords
 * @desc    Get all service keyword patterns
 * @access  Admin
 */
router.get('/keywords', keywordController.getAllKeywords);

/**
 * @route   GET /api/admin/keywords/:servicePattern
 * @desc    Get keywords for specific service pattern
 * @access  Admin
 */
router.get('/keywords/:servicePattern', keywordController.getKeywordsByService);

/**
 * @route   POST /api/admin/keywords
 * @desc    Add or update keyword pattern
 * @access  Admin
 * @body    { servicePattern, keywords, description, priority }
 */
router.post('/keywords', keywordController.addOrUpdateKeywords);

/**
 * @route   DELETE /api/admin/keywords/:id
 * @desc    Delete keyword pattern
 * @access  Admin
 */
router.delete('/keywords/:id', keywordController.deleteKeywords);

/**
 * @route   POST /api/admin/keywords/suggest
 * @desc    Get keyword suggestions for a service type
 * @access  Admin
 * @body    { serviceType }
 */
router.post('/keywords/suggest', keywordController.getKeywordSuggestions);

/**
 * @route   POST /api/admin/keywords/regenerate
 * @desc    Regenerate keywords for all vendors
 * @access  Admin
 */
router.post('/keywords/regenerate', keywordController.regenerateAllVendorKeywords);

/**
 * ==========================================
 * BLOG MANAGEMENT ROUTES
 * ==========================================
 */

/**
 * @route   GET /api/admin/blogs/stats
 * @desc    Get blog statistics
 * @access  Admin
 */
router.get('/blogs/stats', blogController.getBlogStats);

/**
 * @route   GET /api/admin/blogs
 * @desc    Get all blogs (admin view)
 * @access  Admin
 */
router.get('/blogs', blogController.getAllBlogs);

/**
 * @route   POST /api/admin/blogs
 * @desc    Create new blog
 * @access  Admin
 */
router.post('/blogs', blogController.createBlog);

/**
 * @route   GET /api/admin/blogs/:id
 * @desc    Get single blog by ID
 * @access  Admin
 */
router.get('/blogs/:id', blogController.getBlogById);

/**
 * @route   PUT /api/admin/blogs/:id
 * @desc    Update blog
 * @access  Admin
 */
router.put('/blogs/:id', blogController.updateBlog);

/**
 * @route   DELETE /api/admin/blogs/:id
 * @desc    Delete blog
 * @access  Admin
 */
router.delete('/blogs/:id', blogController.deleteBlog);

/**
 * @route   PATCH /api/admin/blogs/:id/toggle-publish
 * @desc    Toggle blog publish status
 * @access  Admin
 */
router.patch('/blogs/:id/toggle-publish', blogController.togglePublish);

module.exports = router;
