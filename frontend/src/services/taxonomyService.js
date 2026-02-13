/**
 * TAXONOMY SERVICE
 * 
 * Frontend service to fetch taxonomy from master database
 * NO hardcoded fallbacks • NO mock data • Strictly database-driven
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all categories
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/taxonomy/categories`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array - NO fallback data
    return [];
  }
};

/**
 * Get subcategories for a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} List of subcategories
 */
export const getSubcategories = async (categoryId) => {
  try {
    if (!categoryId) return [];
    
    const response = await axios.get(`${API_BASE_URL}/taxonomy/subcategories`, {
      params: { categoryId }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};

/**
 * Get services for a subcategory
 * @param {string} subcategoryId - Subcategory ID
 * @returns {Promise<Array>} List of services
 */
export const getServices = async (subcategoryId) => {
  try {
    if (!subcategoryId) return [];
    
    const response = await axios.get(`${API_BASE_URL}/taxonomy/services`, {
      params: { subcategoryId }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

/**
 * Get all services (flat list)
 * @returns {Promise<Array>} List of all services
 */
export const getAllServices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/taxonomy/services/all`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching all services:', error);
    return [];
  }
};

/**
 * Search taxonomy by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} List of matching taxonomy items
 */
export const searchTaxonomy = async (keyword) => {
  try {
    if (!keyword || keyword.trim().length === 0) return [];
    
    const response = await axios.get(`${API_BASE_URL}/taxonomy/search`, {
      params: { q: keyword }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching taxonomy:', error);
    return [];
  }
};

/**
 * Get full taxonomy hierarchy
 * @returns {Promise<Array>} Full hierarchy (categories -> subcategories -> services)
 */
export const getTaxonomyHierarchy = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/taxonomy/hierarchy`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching taxonomy hierarchy:', error);
    return [];
  }
};

/**
 * Get single taxonomy item by ID
 * @param {string} taxonomyId - Taxonomy ID
 * @returns {Promise<Object|null>} Taxonomy item or null
 */
export const getTaxonomyById = async (taxonomyId) => {
  try {
    if (!taxonomyId) return null;
    
    const response = await axios.get(`${API_BASE_URL}/taxonomy/${taxonomyId}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching taxonomy item:', error);
    return null;
  }
};

/**
 * Format taxonomy item for dropdown
 * @param {Object} item - Taxonomy item
 * @returns {Object} Formatted item with value and label
 */
export const formatForDropdown = (item) => {
  return {
    value: item.taxonomyId,
    label: item.name,
    icon: item.icon || '🔧'
  };
};

/**
 * Format array of taxonomy items for dropdown
 * @param {Array} items - Array of taxonomy items
 * @returns {Array} Formatted items
 */
export const formatArrayForDropdown = (items) => {
  return items.map(formatForDropdown);
};

export default {
  getCategories,
  getSubcategories,
  getServices,
  getAllServices,
  searchTaxonomy,
  getTaxonomyHierarchy,
  getTaxonomyById,
  formatForDropdown,
  formatArrayForDropdown
};
