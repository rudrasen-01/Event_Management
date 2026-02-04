import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateFilters } from '../services/filterGenerator';

/**
 * SERVICE CONTEXT - WORLD-CLASS FILTER MANAGEMENT
 * 
 * Intelligent context-aware filtering system
 * Adapts filters based on search intent, category, and user context
 */

const ServiceContext = createContext();

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within ServiceProvider');
  }
  return context;
};

export const ServiceProvider = ({ children }) => {
  // Core State
  const [filterSchema, setFilterSchema] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchContext, setSearchContext] = useState({
    query: '',
    category: null,
    location: '',
    eventType: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize or update filters based on search context
   */
  const updateSearchContext = (context) => {
    setIsLoading(true);
    setSearchContext(context);

    // Generate intelligent filter schema
    setTimeout(() => {
      const schema = generateFilters(context);
      setFilterSchema(schema);
      setIsLoading(false);
    }, 100);
  };

  /**
   * Search with query - detects intent automatically
   */
  const search = (query, location = '', eventType = '') => {
    updateSearchContext({ query, category: null, location, eventType });
  };

  /**
   * Select specific category
   */
  const selectCategory = (category, location = '', eventType = '') => {
    updateSearchContext({ query: '', category, location, eventType });
  };

  /**
   * Update single filter value
   */
  const setFilter = (filterId, value) => {
    setAppliedFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  /**
   * Update multiple filters at once
   */
  const setFilters = (filters) => {
    setAppliedFilters(prev => ({
      ...prev,
      ...filters
    }));
  };

  /**
   * Clear specific filter
   */
  const clearFilter = (filterId) => {
    setAppliedFilters(prev => {
      const updated = { ...prev };
      delete updated[filterId];
      return updated;
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setAppliedFilters({});
  };

  /**
   * Reset entire context
   */
  const reset = () => {
    setFilterSchema(null);
    setAppliedFilters({});
    setSearchContext({ query: '', category: null, location: '', eventType: '' });
  };

  const value = {
    // State
    filterSchema,
    appliedFilters,
    searchContext,
    isLoading,
    
    // Actions
    search,
    selectCategory,
    updateSearchContext,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    reset,
    
    // Computed
    hasActiveFilters: Object.keys(appliedFilters).length > 0,
    activeFilterCount: Object.keys(appliedFilters).length
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export default ServiceContext;
