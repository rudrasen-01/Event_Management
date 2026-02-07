const Vendor = require('../models/VendorNew');
const Service = require('../models/Service');
const { 
  normalizeSearchQuery, 
  buildVendorQuery, 
  getSearchSuggestions 
} = require('../services/searchNormalizationService');
const { 
  generateFiltersFromResults 
} = require('../services/filterService');

exports.searchVendors = async (req, res, next) => {
  try {
    const {
      serviceId,        // Service category (optional if using text search)
      query,            // Text search query (business name, contact person, keywords)
      location,         // { city, area, latitude, longitude, radius }
      budget,           // { min, max }
      filters = {},     // Service-specific filters
      verified,         // Filter by verified status
      rating,           // Minimum rating
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.body;
    
    // STEP 1: Normalize search query using taxonomy
    let normalizedSearch = null;
    let effectiveServiceId = serviceId;
    
    // IMPORTANT: Only use taxonomy normalization if NO text query exists
    // or if explicit serviceId is provided
    // When user types free text, let the regex search handle it across all fields
    if (query && query.trim() && !serviceId) {
      // Normalize user input to taxonomy services - but DON'T USE IT FOR FILTERING
      // Just use it for context and suggestions
      normalizedSearch = await normalizeSearchQuery(query);
      
      // DO NOT set effectiveServiceId from normalized query
      // Let the text search (regex) in the model handle matching across all fields
      // This ensures "photography" matches "corporate-event-photography"
      console.log('📝 Normalized search context:', {
        originalQuery: query,
        bestMatch: normalizedSearch.bestMatch?.label,
        confidence: normalizedSearch.confidence,
        matchType: normalizedSearch.matchType
      });
      console.log('   ⚠️  NOT using normalized serviceId - letting regex search handle it');
    } else if (serviceId) {
      // Explicit serviceId provided (from filter dropdown, not autocomplete)
      effectiveServiceId = serviceId;
      console.log('   ✅ Using explicit serviceId:', effectiveServiceId);
    }
    
    // Optional service validation (don't block search if service not in collection)
    let service = null;
    if (effectiveServiceId && typeof effectiveServiceId === 'string') {
      service = await Service.findOne({ 
        serviceId: effectiveServiceId.toLowerCase(),
        isActive: true 
      });
      
      // Validate filters only if service schema exists
      if (service && filters && Object.keys(filters).length > 0) {
        const validation = service.validateFilters(filters);
        if (!validation.isValid) {
          // Don't block search on filter validation failure
        }
      }
    }
    
    // STEP 2: Prepare comprehensive search parameters
    const searchParams = {
      query: query?.trim() || '',              // Text search on business names
      serviceType: effectiveServiceId || undefined,     // Category filter (can be array)
      location: location ? {
        city: location.city,
        area: location.area,
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius || 10
      } : undefined,
      budget: budget || undefined,
      filters: filters || {},
      verified: verified !== undefined ? verified : undefined,  // Allow filtering by verified status
      rating: rating || undefined,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };
    
    const result = await Vendor.comprehensiveSearch(searchParams);
    
    // Calculate distance for each vendor (if geospatial search used)
    let resultsWithDistance = result.results || [];
    
    if (location?.latitude && location?.longitude && location?.radius) {
      resultsWithDistance = result.results.map(vendor => {
        const vendorLoc = vendor.location?.coordinates;
        if (vendorLoc && vendorLoc.length === 2) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            vendorLoc[1], // latitude
            vendorLoc[0]  // longitude
          );
          
          return {
            ...vendor,
            distance: parseFloat(distance.toFixed(2)),
            distanceUnit: 'km'
          };
        }
        return vendor;
      });
    }
    
    // STEP 3: Generate context-aware filters from current results
    const availableFilters = await generateFiltersFromResults(resultsWithDistance, {
      query: query || '',
      serviceType: effectiveServiceId,
      city: location?.city,
      searchContext: normalizedSearch
    });
    
    // Response format with normalization context
    res.json({
      success: true,
      data: {
        total: result.total,
        results: resultsWithDistance,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        searchCriteria: {
          query: query || null,
          serviceType: serviceId || null,
          location: location || null,
          budget: budget || null,
          verified: verified !== undefined ? verified : null,
          rating: rating || null
        },
        // Normalization context - helps frontend understand what was matched
        normalization: normalizedSearch ? {
          originalQuery: normalizedSearch.originalQuery,
          normalizedQuery: normalizedSearch.normalizedQuery,
          matchType: normalizedSearch.matchType,
          confidence: normalizedSearch.confidence,
          bestMatch: normalizedSearch.bestMatch,
          suggestedServices: normalizedSearch.taxonomyMatches.services.slice(0, 3).map(s => ({
            taxonomyId: s.taxonomyId,
            name: s.name,
            icon: s.icon
          }))
        } : null,
        // Available filters - marketplace-grade, context-aware filters based on current results
        availableFilters
      }
    });
    
    
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
};

// Get intelligent search suggestions based on taxonomy
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q, limit = 12 } = req.query;
    
    // Return empty array for very short queries
    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await getSearchSuggestions(q.trim(), parseInt(limit));
    
    res.json({
      success: true,
      query: q,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    next(error);
  }
};

exports.getVendorById = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await Vendor.findOne({ 
      vendorId,
      isActive: true 
    }).select('-verificationDocuments');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedVendors = async (req, res, next) => {
  try {
    const { serviceType, city, limit = 10 } = req.query;
    
    let query = { isActive: true, isFeatured: true };
    
    if (serviceType) {
      query.serviceType = serviceType.toLowerCase();
    }
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    const vendors = await Vendor.find(query)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(parseInt(limit))
      .select('-reviews -verificationDocuments');
    
    res.json({
      success: true,
      count: vendors.length,
      data: vendors.map(v => v.toSearchResult())
    });
  } catch (error) {
    next(error);
  }
};

exports.getVendorsByService = async (req, res, next) => {
  try {
    const { serviceType } = req.params;
    const { city, page = 1, limit = 20 } = req.query;
    
    let query = { 
      serviceType: serviceType.toLowerCase(),
      isActive: true 
    };
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    const skip = (page - 1) * limit;
    
    const vendors = await Vendor.find(query)
      .sort({ rating: -1, reviewCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews -verificationDocuments');
    
    const total = await Vendor.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        results: vendors.map(v => v.toSearchResult())
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
