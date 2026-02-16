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
const { 
  searchVendors: unifiedSearch 
} = require('../services/unifiedSearchService');

exports.searchVendors = async (req, res, next) => {
  try {
    const {
      serviceId,        // Service category (optional if using text search)
      query,            // Text search query (business name, contact person, keywords)
      location,         // { city, area, areaId, latitude, longitude, radius }
      budget,           // { min, max }
      filters = {},     // Service-specific filters
      verified,         // Filter by verified status
      rating,           // Minimum rating
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.body;

    console.log('\n🔍 UNIFIED SEARCH REQUEST');
    console.log('━'.repeat(70));
    console.log('Request parameters:', {
      query: query || '(none)',
      serviceId: serviceId || '(any)',
      location,
      budget,
      filters,
      verified,
      rating
    });
    console.log('━'.repeat(70));
    
    // STEP 1: Normalize search query using taxonomy (for context)
    let normalizedSearch = null;
    
    if (query && query.trim() && !serviceId) {
      normalizedSearch = await normalizeSearchQuery(query);
      console.log('📝 Query normalization:', {
        originalQuery: query,
        bestMatch: normalizedSearch.bestMatch?.label,
        confidence: normalizedSearch.confidence
      });
    }
    
    // STEP 2: Prepare unified search parameters
    const searchParams = {
      query: query?.trim() || '',
      serviceType: serviceId?.toLowerCase(),
      city: location?.city,
      area: location?.area,
      areaId: location?.areaId,
      latitude: location?.latitude,
      longitude: location?.longitude,
      radius: location?.radius,
      budget: budget || {},
      filters: filters || {},
      verified: verified !== undefined ? verified : undefined,
      rating: rating || undefined,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };
    
    // STEP 3: Execute unified search
    const searchResult = await unifiedSearch(searchParams);
    
    // STEP 4: Generate context-aware filters from results
    const availableFilters = await generateFiltersFromResults(
      searchResult.results,
      {
        query: query || '',
        serviceType: serviceId,
        city: location?.city,
        searchContext: normalizedSearch
      }
    );
    
    console.log('✅ Search completed successfully');
    console.log(`   Total results: ${searchResult.total}`);
    console.log(`   Page ${searchResult.page}/${searchResult.totalPages}`);
    console.log(`   Tier breakdown:`, searchResult.metadata.tierBreakdown);
    console.log('━'.repeat(70) + '\n');
    
    // STEP 5: Send response
    res.json({
      success: true,
      data: {
        total: searchResult.total,
        results: searchResult.results,
        page: searchResult.page,
        limit: searchResult.limit,
        totalPages: searchResult.totalPages,
        hasNextPage: searchResult.hasNextPage,
        hasPrevPage: searchResult.hasPrevPage,
        searchCriteria: {
          query: query || null,
          serviceType: serviceId || null,
          location: searchResult.metadata.searchLocation,
          budget: budget || null,
          verified: verified !== undefined ? verified : null,
          rating: rating || null
        },
        // Search quality metrics
        searchQuality: {
          tierBreakdown: searchResult.metadata.tierBreakdown,
          priorityOrder: [
            'Exact area match',
            'Nearby vendors',
            'Same city vendors',
            'Adjacent city vendors'
          ],
          radiusUsed: searchResult.metadata.searchLocation.radiusKm,
          totalMatches: searchResult.total
        },
        // Normalization context (for debugging/UI)
        normalization: normalizedSearch ? {
          originalQuery: normalizedSearch.originalQuery,
          matchType: normalizedSearch.matchType,
          confidence: normalizedSearch.confidence,
          bestMatch: normalizedSearch.bestMatch,
          suggestedServices: normalizedSearch.taxonomyMatches.services
            .slice(0, 3)
            .map(s => ({
              taxonomyId: s.taxonomyId,
              name: s.name,
              icon: s.icon
            }))
        } : null,
        // Available filters based on current results
        availableFilters,
        // Metadata
        metadata: searchResult.metadata
      }
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
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
