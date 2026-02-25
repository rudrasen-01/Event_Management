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

    // Build suggestions with similarity and composite scoring
    const candidates = Array.isArray(searchResult.results) ? searchResult.results : [];

    // Helper functions for scoring
    const tokenize = str => (str || '').toString().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

    const jaccard = (aTokens, bTokens) => {
      const a = new Set(aTokens);
      const b = new Set(bTokens);
      if (a.size === 0 || b.size === 0) return 0;
      const inter = [...a].filter(x => b.has(x)).length;
      const uni = new Set([...a, ...b]).size;
      return uni === 0 ? 0 : inter / uni;
    };

    const computeSimilarity = (queryText, vendor) => {
      // Token overlap between query and vendor searchable fields
      const qTokens = tokenize(queryText);
      const nameTokens = tokenize(vendor.name || vendor.businessName || '');
      const serviceTokens = tokenize(vendor.serviceType || '');
      const locTokens = tokenize([vendor.city, vendor.area].filter(Boolean).join(' '));

      const nameSim = jaccard(qTokens, nameTokens);
      const serviceSim = jaccard(qTokens, serviceTokens);
      const locSim = jaccard(qTokens, locTokens);

      // Tier priority boost (if unifiedSearchService included tierPriority)
      const tierBoost = vendor.tierPriority ? (1 / vendor.tierPriority) : 0;

      // Combine into normalized similarity 0..1
      const raw = Math.max(nameSim * 1.2, serviceSim * 1.1, locSim) + (tierBoost * 0.15);

      // If semantic score present (from vector DB), fold it in
      const semantic = vendor.semanticScore ? Math.tanh(vendor.semanticScore / 10) : 0; // normalize approx
      const combined = Math.min(1, raw + (semantic * 0.25));
      return combined;
    };

    const { weights: CONFIG_WEIGHTS, distanceScaleKm } = require('../config/searchWeights');

    const computeCompositeScore = (vendor, similarity) => {
      // Components normalized to 0..1
      const rating = (vendor.rating || 0) / 5;
      const verified = vendor.verified ? 1 : 0;
      const popularity = Math.min(1, (vendor.popularityScore || 0) / 100);
      const distanceKm = typeof vendor.distance === 'number' ? vendor.distance : (vendor.distanceKm || null);
      const distanceScore = distanceKm !== null && distanceKm !== undefined ? (1 / (1 + (distanceKm / (distanceScaleKm || 5)))) : 0;

      // include semantic score if present (normalize semanticScore or similarity)
      const semantic = vendor.semanticScore ? Math.tanh(vendor.semanticScore / 10) : 0;

      const weights = CONFIG_WEIGHTS;

      const score = (weights.similarity * similarity)
                  + (weights.semantic * semantic)
                  + (weights.rating * rating)
                  + (weights.distance * distanceScore)
                  + (weights.verified * verified)
                  + (weights.popularity * popularity);

      return Math.round(score * 1000) / 1000; // 3 decimal places
    };

    // Annotate candidates
    const annotated = candidates.map(v => {
      const sim = computeSimilarity(searchParams.query || query || '', v);
      const composite = computeCompositeScore(v, sim);
      return {
        ...v,
        similarityScore: sim,
        computedScore: composite
      };
    });

    // Sort by composite score desc, then rating, then pop
    annotated.sort((a, b) => {
      if (b.computedScore !== a.computedScore) return b.computedScore - a.computedScore;
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      return (b.popularityScore || 0) - (a.popularityScore || 0);
    });

    // If no candidates found, ensure fallback: fetch popular vendors in city or global
    let finalCandidates = annotated;
    if (finalCandidates.length === 0) {
      console.log('   ⚠️ No candidates from unified search, fetching popular fallbacks');
      const fallbackQuery = {};
      if (searchParams.city) fallbackQuery.city = new RegExp(searchParams.city, 'i');
      const fallbacks = await Vendor.find({ isActive: true, ...fallbackQuery })
        .sort({ popularityScore: -1, rating: -1 })
        .limit(10)
        .select('-password -verificationDocuments')
        .lean();

      finalCandidates = fallbacks.map(v => ({
        ...v,
        similarityScore: computeSimilarity(searchParams.query || query || '', v),
        computedScore: computeCompositeScore(v, computeSimilarity(searchParams.query || query || '', v))
      }));
    }

    // Format suggestions per required response structure
    const suggestions = finalCandidates.slice(0, 20).map(v => ({
      id: v.vendorId || v._id,
      name: v.name,
      category: v.serviceType,
      similarityScore: v.similarityScore,
      rating: v.rating || 0,
      distance: v.distance || v.distanceKm || null
    }));

    // Suggested keywords (use normalization service suggestions if available)
    const suggestedKeywords = normalizedSearch && normalizedSearch.taxonomyMatches
      ? (normalizedSearch.taxonomyMatches.services || []).slice(0,3).map(s => s.name)
      : (await getSearchSuggestions(query || searchParams.query || '', 5)).map(s => s.label);

    // exactMatchFound heuristics: any candidate with very high similarity or exact name match
    const exactMatchFound = finalCandidates.some(v => (v.similarityScore >= 0.98) || ((v.name || '').toLowerCase() === (query || '').toLowerCase()));

    const message = exactMatchFound ? 'Exact results' : 'No exact match found. Showing similar results.';

    // Primary response object mandated by requirements
    const responsePayload = {
      query: query || searchParams.query || '',
      exactMatchFound,
      message,
      suggestions,
      suggestedKeywords
    };

    // Also keep legacy data for UI debug if needed
    const legacy = {
      total: searchResult.total,
      page: searchResult.page,
      limit: searchResult.limit,
      totalPages: searchResult.totalPages,
      hasNextPage: searchResult.hasNextPage,
      hasPrevPage: searchResult.hasPrevPage,
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
      normalization: normalizedSearch || null,
      availableFilters,
      metadata: searchResult.metadata
    };

    // Send final response: include unified search results and metadata
    res.json({
      success: true,
      // Unified search results (for frontend compatibility)
      results: Array.isArray(searchResult.results) ? searchResult.results : [],
      total: searchResult.total || 0,
      page: searchResult.page || 1,
      limit: searchResult.limit || 20,
      totalPages: searchResult.totalPages || Math.ceil((searchResult.total || 0) / (searchResult.limit || 20)),
      searchQuality: {
        tierBreakdown: searchResult.metadata?.tierBreakdown || null
      },
      metadata: searchResult.metadata || {},
      // Legacy / UX-friendly payload
      ...responsePayload,
      legacy
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
