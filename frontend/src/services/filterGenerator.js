/**
 * DYNAMIC FILTER GENERATOR
 * 
 * JustDial-level intelligent filter system that:
 * - Generates filters based on search context (keyword, category, location)
 * - Adapts to detected service intent
 * - Supports hierarchical multi-level filters
 * - Returns backend-friendly filter schema
 * 
 * Architecture:
 * Frontend calls: generateFilters({ query, category, location, eventType })
 * Returns: { universal: [...], specific: [...], hierarchy: {...} }
 * 
 * Future: Replace with POST /api/filters endpoint
 */

import SERVICE_FILTER_CONFIG from '../config/serviceFilters';
import EVENT_TAXONOMY from '../config/eventTaxonomy';
import { detectServiceFromQuery } from './filterService';

/**
 * Universal filters that always appear regardless of category
 */
const UNIVERSAL_FILTERS = [
  {
    id: 'sort_by',
    label: 'Sort By',
    type: 'radio',
    priority: 1,
    options: [
      { value: 'relevance', label: 'Most Relevant', default: true },
      { value: 'rating', label: 'Top Rated', icon: '⭐' },
      { value: 'price_low', label: 'Price: Low to High', icon: '₹' },
      { value: 'price_high', label: 'Price: High to Low', icon: '₹₹₹' },
      { value: 'distance', label: 'Nearest First', icon: '📍' },
      { value: 'response_time', label: 'Quick Responders', icon: '⚡' }
    ]
  },
  {
    id: 'verified_only',
    label: 'Verified Vendors Only',
    type: 'checkbox',
    priority: 2,
    icon: '✓',
    badge: 'Trusted'
  },
  {
    id: 'rating',
    label: 'Minimum Rating',
    type: 'radio',
    priority: 3,
    options: [
      { value: '4.5', label: '4.5+ ⭐⭐⭐⭐' },
      { value: '4.0', label: '4.0+ ⭐⭐⭐⭐' },
      { value: '3.5', label: '3.5+ ⭐⭐⭐' },
      { value: '3.0', label: '3.0+' }
    ]
  },
  {
    id: 'deals',
    label: 'Deals & Offers',
    type: 'checkbox',
    priority: 4,
    icon: '🏷️'
  },
  {
    id: 'budget',
    label: 'Budget Range',
    type: 'range',
    priority: 5,
    min: 0,
    max: 1000000,
    step: 1000,
    unit: 'INR',
    presets: [
      { label: 'Under ₹10K', max: 10000 },
      { label: '₹10K-₹25K', min: 10000, max: 25000 },
      { label: '₹25K-₹50K', min: 25000, max: 50000 },
      { label: '₹50K-₹1L', min: 50000, max: 100000 },
      { label: '₹1L-₹3L', min: 100000, max: 300000 },
      { label: '₹3L+', min: 300000 }
    ]
  },
  {
    id: 'response_time',
    label: 'Response Time',
    type: 'radio',
    priority: 6,
    options: [
      { value: 'within_1hr', label: 'Within 1 hour' },
      { value: 'within_4hr', label: 'Within 4 hours' },
      { value: 'within_24hr', label: 'Within 24 hours' }
    ]
  }
];

/**
 * Generate context-aware filters based on search parameters
 * 
 * @param {object} context - { query, category, location, eventType }
 * @returns {object} - { universal, specific, hierarchy }
 */
export const generateFilters = (context = {}) => {
  const { query = '', category = '', eventType = '', location = {} } = context;
  
  const result = {
    universal: UNIVERSAL_FILTERS,
    specific: [],
    hierarchy: null,
    detectedService: null
  };

  // Step 1: Detect service intent from query or category
  let detectedServiceId = null;
  
  if (query) {
    detectedServiceId = detectServiceFromQuery(query);
  }
  
  if (!detectedServiceId && category) {
    detectedServiceId = detectServiceFromQuery(category);
  }

  result.detectedService = detectedServiceId;

  // Step 2: Get service-specific filters from config
  if (detectedServiceId && SERVICE_FILTER_CONFIG[detectedServiceId]) {
    const serviceConfig = SERVICE_FILTER_CONFIG[detectedServiceId];
    result.specific = serviceConfig.filters || [];
    
    // Add service-specific budget presets if available
    if (serviceConfig.budgetRange) {
      const budgetFilter = result.universal.find(f => f.id === 'budget');
      if (budgetFilter) {
        budgetFilter.min = serviceConfig.budgetRange.min;
        budgetFilter.max = serviceConfig.budgetRange.max;
        budgetFilter.presets = serviceConfig.budgetRange.presets || budgetFilter.presets;
      }
    }
  }

  // Step 3: Generate hierarchical filters from taxonomy
  const hierarchy = generateHierarchicalFilters(query, category, eventType);
  if (hierarchy.categories.length > 0) {
    result.hierarchy = hierarchy;
  }

  // Step 4: Add event-type specific filters if detected
  if (eventType) {
    result.specific.push({
      id: 'event_type',
      label: 'Event Type',
      type: 'select',
      value: eventType,
      options: [
        { value: 'wedding', label: 'Wedding' },
        { value: 'birthday', label: 'Birthday' },
        { value: 'corporate', label: 'Corporate Event' },
        { value: 'anniversary', label: 'Anniversary' },
        { value: 'religious', label: 'Religious Ceremony' },
        { value: 'party', label: 'Party' }
      ]
    });
  }

  // Step 5: Add location-based filters
  if (location.city) {
    result.specific.unshift({
      id: 'location_city',
      label: 'City',
      type: 'select',
      value: location.city,
      locked: true
    });
  }

  return result;
};

/**
 * Generate hierarchical category filters from taxonomy
 * Supports: Category → Sub-Category → Service Type → Specialization
 */
const generateHierarchicalFilters = (query, category, eventType) => {
  const hierarchy = {
    type: 'hierarchy',
    categories: []
  };

  const normalized = (query || '').toLowerCase();

  (EVENT_TAXONOMY || []).forEach(section => {
    // Ensure arrays exist before calling array methods
    const title = section.title || '';
    const vendorsArr = Array.isArray(section.vendors) ? section.vendors : [];
    const servicesArr = Array.isArray(section.services) ? section.services : [];

    // Check if this section is relevant to the query
    const isRelevant = 
      (title.toLowerCase().includes(normalized)) ||
      (normalized && normalized.includes(title.toLowerCase())) ||
      vendorsArr.some(v => String(v).toLowerCase().includes(normalized)) ||
      servicesArr.some(s => String(s).toLowerCase().includes(normalized));

    if (isRelevant || !query) {
      const categoryNode = {
        id: section.id,
        label: section.title,
        expanded: isRelevant,
        children: []
      };

      // Add vendor types as checkboxes
      if (vendorsArr.length > 0) {
        categoryNode.children.push({
          id: `${section.id}_vendors`,
          label: 'Vendor Type',
          type: 'multiselect',
          options: vendorsArr.map(v => ({
            value: String(v).toLowerCase().replace(/\s+/g, '_'),
            label: v
          }))
        });
      }

      // Add services as checkboxes
      if (servicesArr.length > 0) {
        categoryNode.children.push({
          id: `${section.id}_services`,
          label: 'Services Offered',
          type: 'multiselect',
          options: servicesArr.slice(0, 10).map(s => ({
            value: String(s).toLowerCase().replace(/\s+/g, '_'),
            label: s
          }))
        });
      }

      if (categoryNode.children.length > 0) {
        hierarchy.categories.push(categoryNode);
      }
    }
  });

  // Limit to top 3 most relevant categories for performance
  hierarchy.categories = hierarchy.categories.slice(0, 3);

  return hierarchy;
};

/**
 * Get filter schema for a specific service type
 * Used when user clicks a category directly
 */
export const getFiltersForService = (serviceId) => {
  const config = SERVICE_FILTER_CONFIG[serviceId];
  if (!config) {
    return {
      universal: UNIVERSAL_FILTERS,
      specific: [],
      hierarchy: null
    };
  }

  return {
    universal: UNIVERSAL_FILTERS,
    specific: config.filters || [],
    hierarchy: null,
    detectedService: serviceId
  };
};

/**
 * Validate applied filters against schema
 */
export const validateAppliedFilters = (appliedFilters, filterSchema) => {
  const errors = [];
  const validated = {};

  Object.keys(appliedFilters).forEach(filterId => {
    const value = appliedFilters[filterId];
    
    // Find filter in schema
    const filter = 
      filterSchema.universal.find(f => f.id === filterId) ||
      filterSchema.specific.find(f => f.id === filterId);

    if (!filter) {
      errors.push({ filterId, message: 'Unknown filter' });
      return;
    }

    // Type-specific validation
    if (filter.type === 'range') {
      if (value.min < filter.min || value.max > filter.max) {
        errors.push({ filterId, message: 'Range out of bounds' });
      } else {
        validated[filterId] = value;
      }
    } else if (filter.type === 'multiselect') {
      if (Array.isArray(value)) {
        validated[filterId] = value;
      }
    } else {
      validated[filterId] = value;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validated
  };
};

/**
 * Build search query with applied filters
 * Backend-ready format
 */
export const buildFilteredSearchQuery = (baseQuery, appliedFilters) => {
  return {
    ...baseQuery,
    filters: appliedFilters,
    timestamp: Date.now()
  };
};

export default {
  generateFilters,
  getFiltersForService,
  validateAppliedFilters,
  buildFilteredSearchQuery,
  UNIVERSAL_FILTERS
};
