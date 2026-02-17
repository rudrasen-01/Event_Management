const express = require('express');
const router = express.Router();
const {
  searchVendors,
  getVendorById,
  getFeaturedVendors,
  getVendorsByService,
  getSearchSuggestions
} = require('../controllers/searchController');


// @route   POST /api/search
// @desc    Advanced vendor search with filters (includes normalization)
// @access  Public
router.post('/', searchVendors);

// @route   GET /api/search/suggestions?q=query
// @desc    Get intelligent search suggestions from taxonomy
// @access  Public
router.get('/suggestions', getSearchSuggestions);

// @route   GET /api/search/featured
// @desc    Get featured vendors
// @access  Public
router.get('/featured', getFeaturedVendors);


// @route   GET /api/search/by-service/:serviceType
// @desc    Get vendors by service type
// @access  Public
router.get('/by-service/:serviceType', getVendorsByService);

// @route   GET /api/search/vendor/:vendorId
// @desc    Get vendor details by ID
// @access  Public
router.get('/vendor/:vendorId', getVendorById);

module.exports = router;
