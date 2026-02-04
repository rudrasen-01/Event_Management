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

// Public Routes

// @route   POST /api/vendors/register
// @desc    Register a new vendor
// @access  Public
router.post('/register', registerVendor);

// @route   POST /api/vendors/login
// @desc    Login vendor
// @access  Public
router.post('/login', loginVendor);

// @route   GET /api/vendors/:vendorId
// @desc    Get vendor profile
// @access  Public
router.get('/:vendorId', getVendor);

// @route   POST /api/vendors/:vendorId/review
// @desc    Add review to vendor
// @access  Public (should be authenticated)
router.post('/:vendorId/review', addReview);

// Vendor Routes (should be protected with auth middleware)

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
