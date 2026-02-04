/**
 * SERVICE DETECTION & CONTEXT MANAGEMENT
 * 
 * This service detects which service the user is searching for
 * based on their query and manages the active service context
 * 
 * Backend-Ready: When backend is implemented, replace keyword matching
 * with ML-based intent detection API call
 */

import SERVICE_FILTER_CONFIG from '../config/serviceFilters';
import EVENT_TAXONOMY from '../config/eventTaxonomy';

/**
 * Detect service from search query
 * 
 * @param {string} query - User's search query
 * @returns {string|null} - Service ID or null if no match
 * 
 * Future: Replace with POST /api/detect-service-intent
 * Body: { query: '...' }
 * Response: { serviceId: 'photography', confidence: 0.95 }
 */
export const detectServiceFromQuery = (query) => {
  if (!query || typeof query !== 'string') return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check each service's keywords
  for (const [serviceId, config] of Object.entries(SERVICE_FILTER_CONFIG)) {
    const keywords = config.keywords || [];
    
    // Check if any keyword matches
    const hasMatch = keywords.some(keyword => 
      normalizedQuery.includes(keyword.toLowerCase())
    );
    
    if (hasMatch) {
      return serviceId;
    }
  }
  
  return null; // No service detected - show generic search
};

/**
 * Get service configuration by ID
 * 
 * @param {string} serviceId
 * @returns {object|null}
 * 
 * Future: GET /api/services/{serviceId}
 */
export const getServiceConfig = (serviceId) => {
  return SERVICE_FILTER_CONFIG[serviceId] || null;
};

/**
 * Get all available services
 * 
 * @returns {array}
 * 
 * Future: GET /api/services
 */
export const getAllServices = () => {
  return Object.entries(SERVICE_FILTER_CONFIG).map(([id, config]) => ({
    serviceId: id,
    serviceName: config.serviceName,
    icon: config.icon,
    keywords: config.keywords
  }));
};

/**
 * Merge common filters with service-specific filters
 * 
 * @param {string} serviceId
 * @param {object} commonFilters
 * @returns {object} - Merged filter configuration
 */
export const getMergedFilters = (serviceId, commonFilters) => {
  const serviceConfig = getServiceConfig(serviceId);
  
  if (!serviceConfig) {
    return {
      common: commonFilters,
      specific: [],
      budgetRange: null
    };
  }
  
  return {
    common: commonFilters,
    specific: serviceConfig.filters || [],
    budgetRange: serviceConfig.budgetRange,
    defaultSort: serviceConfig.defaultSort,
    priorityFilters: serviceConfig.priorityFilters || []
  };
};

/**
 * Build search payload for backend
 * 
 * @param {object} params
 * @returns {object} - Backend-ready search payload
 * 
 * Future: POST /api/search
 */
export const buildSearchPayload = ({
  serviceId,
  query,
  location,
  budget,
  filters = {},
  sort = 'relevance',
  page = 1,
  limit = 20
}) => {
  return {
    serviceId,
    query,
    location: {
      city: location.city,
      area: location.area || null,
      latitude: location.latitude || null,
      longitude: location.longitude || null,
      radius: location.radius || 10
    },
    budget: budget ? {
      min: budget.min || 0,
      max: budget.max || null
    } : null,
    filters: Object.entries(filters).reduce((acc, [key, value]) => {
      // Only include non-empty filter values
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        acc[key] = value;
      }
      return acc;
    }, {}),
    sort,
    page,
    limit
  };
};

/**
 * Validate filter values against schema
 * 
 * @param {object} filterValues
 * @param {object} filterSchema
 * @returns {object} - { valid: boolean, errors: [] }
 */
export const validateFilters = (filterValues, filterSchema) => {
  const errors = [];
  
  filterSchema.forEach(filter => {
    const value = filterValues[filter.id];
    
    // Check required filters
    if (filter.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors.push({
        filterId: filter.id,
        message: `${filter.label} is required`
      });
    }
    
    // Validate range filters
    if (filter.type === 'range' && value) {
      if (value < filter.min || value > filter.max) {
        errors.push({
          filterId: filter.id,
          message: `${filter.label} must be between ${filter.min} and ${filter.max}`
        });
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get suggested services based on partial query
 * 
 * @param {string} partialQuery
 * @returns {array} - Suggested services
 * 
 * Future: GET /api/services/suggestions?q={query}
 */
export const getSuggestedServices = (partialQuery) => {
  if (!partialQuery || (typeof partialQuery === 'string' && partialQuery.length < 1)) return [];

  const normalized = partialQuery.toLowerCase();
  const suggestions = [];

  // First, score SERVICE_FILTER_CONFIG entries by keyword relevance
  Object.entries(SERVICE_FILTER_CONFIG).forEach(([id, config]) => {
    const keywords = config.keywords || [];
    const score = keywords.reduce((acc, keyword) => {
      const k = keyword.toLowerCase();
      if (k.includes(normalized)) return acc + 3;
      if (normalized.includes(k)) return acc + 2;
      if (k.startsWith(normalized) || normalized.startsWith(k)) return acc + 1;
      return acc;
    }, 0);

    if (score > 0) {
      suggestions.push({
        type: 'service',
        id,
        serviceName: config.serviceName,
        icon: config.icon || '🔧',
        score
      });
    }
  });

  // Next, include matches from EVENT_TAXONOMY (vendors & services)
  EVENT_TAXONOMY.forEach(section => {
    // vendors
    (section.vendors || []).forEach(v => {
      const label = String(v).toLowerCase();
      let score = 0;
      if (label.includes(normalized)) score += 3;
      if (normalized.includes(label)) score += 2;
      if (label.startsWith(normalized) || normalized.startsWith(label)) score += 1;
      if (score > 0) {
        suggestions.push({ type: 'vendor', id: `tax-${section.id}-${label}`, serviceName: v, icon: '🏷️', score });
      }
    });

    // services
    (section.services || []).forEach(s => {
      const label = String(s).toLowerCase();
      let score = 0;
      if (label.includes(normalized)) score += 2;
      if (normalized.includes(label)) score += 1;
      if (label.startsWith(normalized) || normalized.startsWith(label)) score += 1;
      if (score > 0) {
        suggestions.push({ type: 'tax-service', id: `tax-${section.id}-${label}`, serviceName: s, icon: '⚙️', score });
      }
    });
  });

  // Deduplicate by serviceName, keep highest score
  const dedup = {};
  suggestions.forEach(s => {
    const key = s.serviceName.toLowerCase();
    if (!dedup[key] || dedup[key].score < s.score) dedup[key] = s;
  });

  const final = Object.values(dedup).sort((a, b) => b.score - a.score).slice(0, 8);
  return final.map(s => ({ serviceId: s.id, serviceName: s.serviceName, icon: s.icon, score: s.score }));
};

export default {
  detectServiceFromQuery,
  getServiceConfig,
  getAllServices,
  getMergedFilters,
  buildSearchPayload,
  validateFilters,
  getSuggestedServices
};
