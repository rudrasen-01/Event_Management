/**
 * DYNAMIC SERVICE & FILTER API
 * Production-ready endpoints for scalable marketplace
 */

const express = require('express');
const router = express.Router();
const Vendor = require('../models/VendorNew');
const Service = require('../models/Service');

/**
 * GET /api/dynamic/service-types
 * Returns all unique service types from actual vendors in database
 * Used for filter dropdowns - always reflects current data
 */
router.get('/service-types', async (req, res) => {
  try {
    // Get distinct service types from vendors
    const serviceTypes = await Vendor.distinct('serviceType', { isActive: true });
    
    // Enrich with counts and display names
    const enriched = await Promise.all(
      serviceTypes.map(async (type) => {
        const count = await Vendor.countDocuments({ 
          serviceType: type, 
          isActive: true 
        });
        
        // Capitalize for display
        const displayName = type
          .split(/[_\s-]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          value: type,
          label: displayName,
          count,
          available: count > 0
        };
      })
    );
    
    // Sort by count (most vendors first)
    enriched.sort((a, b) => b.count - a.count);
    
    res.json({
      success: true,
      data: enriched.filter(s => s.available) // Only show types with vendors
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/dynamic/cities
 * Returns all unique cities from actual vendors in database
 * Used for location filters - always reflects current coverage
 */
router.get('/cities', async (req, res) => {
  try {
    const cities = await Vendor.distinct('city', { isActive: true });
    
    // Enrich with vendor counts
    const enriched = await Promise.all(
      cities.filter(city => city).map(async (city) => {
        const count = await Vendor.countDocuments({ 
          city, 
          isActive: true 
        });
        
        return {
          name: city,
          count,
          state: 'India' // Can be enhanced with state mapping
        };
      })
    );
    
    // Sort alphabetically
    enriched.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      success: true,
      data: enriched.filter(c => c.count > 0)
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/dynamic/price-ranges
 * Returns dynamic price ranges based on actual vendor pricing
 * Creates intelligent buckets from real data
 */
router.get('/price-ranges', async (req, res) => {
  try {
    const { serviceType, city } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (serviceType) filter.serviceType = new RegExp(serviceType, 'i');
    if (city) filter.city = new RegExp(city, 'i');
    
    // Get min and max prices from actual vendors
    const vendors = await Vendor.find(filter).select('pricing');
    
    if (vendors.length === 0) {
      return res.json({
        success: true,
        data: {
          min: 0,
          max: 10000000,
          presets: [
            { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
            { label: '₹1L - ₹3L', min: 100000, max: 300000 },
            { label: '₹3L - ₹5L', min: 300000, max: 500000 },
            { label: '₹5L - ₹10L', min: 500000, max: 1000000 },
            { label: 'Above ₹10L', min: 1000000, max: 10000000 }
          ]
        }
      });
    }
    
    // Calculate actual min/max from vendor data
    let minPrice = Infinity;
    let maxPrice = 0;
    
    vendors.forEach(v => {
      if (v.pricing?.min && v.pricing.min < minPrice) minPrice = v.pricing.min;
      if (v.pricing?.max && v.pricing.max > maxPrice) maxPrice = v.pricing.max;
    });
    
    // Round to nearest thousand
    minPrice = Math.floor(minPrice / 1000) * 1000;
    maxPrice = Math.ceil(maxPrice / 1000) * 1000;
    
    // Create dynamic presets based on actual data
    const range = maxPrice - minPrice;
    const presets = [];
    
    if (range > 0) {
      const step = range / 5;
      for (let i = 0; i < 5; i++) {
        const bucketMin = Math.floor(minPrice + (step * i));
        const bucketMax = Math.floor(minPrice + (step * (i + 1)));
        
        const formatPrice = (price) => {
          if (price >= 100000) return `₹${price / 100000}L`;
          if (price >= 1000) return `₹${price / 1000}K`;
          return `₹${price}`;
        };
        
        presets.push({
          label: `${formatPrice(bucketMin)} - ${formatPrice(bucketMax)}`,
          min: bucketMin,
          max: bucketMax
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        min: minPrice,
        max: maxPrice,
        presets: presets.length > 0 ? presets : [
          { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
          { label: '₹1L - ₹3L', min: 100000, max: 300000 },
          { label: '₹3L - ₹5L', min: 300000, max: 500000 },
          { label: '₹5L - ₹10L', min: 500000, max: 1000000 },
          { label: 'Above ₹10L', min: 1000000, max: 10000000 }
        ]
      }
    });
  } catch (error) {
    console.error('Error calculating price ranges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/dynamic/search-suggestions
 * Intelligent autocomplete from actual database
 * Combines vendors, service types, and cities
 */
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const regex = new RegExp(q, 'i');
    const suggestions = [];
    
    // 1. Matching vendor names (top 3)
    const vendors = await Vendor.find({
      $or: [
        { name: regex },
        { businessName: regex },
        { contactPerson: regex }
      ],
      isActive: true
    })
      .select('name businessName serviceType city verified')
      .limit(3);
    
    vendors.forEach(v => {
      suggestions.push({
        type: 'vendor',
        text: v.businessName || v.name,
        subtext: `${v.serviceType} in ${v.city}`,
        icon: '🏪',
        verified: v.verified,
        priority: 3
      });
    });
    
    // 2. Matching service types
    const serviceTypes = await Vendor.distinct('serviceType', {
      serviceType: regex,
      isActive: true
    });
    
    serviceTypes.slice(0, 3).forEach(type => {
      const displayName = type
        .split(/[_\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      suggestions.push({
        type: 'service',
        text: displayName,
        subtext: 'Service Category',
        icon: '🔧',
        priority: 2
      });
    });
    
    // 3. Matching cities
    const cities = await Vendor.distinct('city', {
      city: regex,
      isActive: true
    });
    
    cities.slice(0, 2).forEach(city => {
      suggestions.push({
        type: 'city',
        text: city,
        subtext: 'Location',
        icon: '📍',
        priority: 1
      });
    });
    
    // Sort by priority (vendors first)
    suggestions.sort((a, b) => b.priority - a.priority);
    
    res.json({
      success: true,
      data: suggestions.slice(0, limit)
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/dynamic/filter-stats
 * Returns statistics for all filters based on actual data
 * Used to show counts in UI (e.g., "Verified (42)")
 */
router.get('/filter-stats', async (req, res) => {
  try {
    const { city, serviceType } = req.query;
    
    // Build base filter
    const baseFilter = { isActive: true };
    if (city) baseFilter.city = new RegExp(city, 'i');
    if (serviceType) baseFilter.serviceType = new RegExp(serviceType, 'i');
    
    // Get counts for each filter option
    const stats = {
      verified: await Vendor.countDocuments({ ...baseFilter, verified: true }),
      total: await Vendor.countDocuments(baseFilter),
      ratingBreakdown: {
        '4_plus': await Vendor.countDocuments({ ...baseFilter, rating: { $gte: 4 } }),
        '3_plus': await Vendor.countDocuments({ ...baseFilter, rating: { $gte: 3 } }),
        '2_plus': await Vendor.countDocuments({ ...baseFilter, rating: { $gte: 2 } })
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error calculating filter stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
