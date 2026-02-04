/**
 * DYNAMIC DATA API SERVICE
 * Fetches all filter options, service types, cities from live database
 * NO STATIC DATA - Everything is database-driven
 */

import axios from 'axios';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all service types from actual vendors in database
 * Replaces hardcoded serviceTypes arrays
 */
export const fetchServiceTypes = async () => {
  try {
    const response = await apiClient.get('/dynamic/service-types');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching service types:', error);
    return [];
  }
};

/**
 * Fetch all cities from actual vendors in database
 * Replaces hardcoded CITIES arrays
 */
export const fetchCities = async () => {
  try {
    const response = await apiClient.get('/dynamic/cities');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

/**
 * Fetch dynamic price ranges based on actual vendor pricing
 * Optionally filtered by service type and city
 */
export const fetchPriceRanges = async (serviceType = null, city = null) => {
  try {
    const params = {};
    if (serviceType) params.serviceType = serviceType;
    if (city) params.city = city;
    
    const response = await apiClient.get('/dynamic/price-ranges', { params });
    return response.data?.data || { min: 0, max: 10000000, presets: [] };
  } catch (error) {
    console.error('Error fetching price ranges:', error);
    return {
      min: 0,
      max: 10000000,
      presets: [
        { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
        { label: '₹1L - ₹3L', min: 100000, max: 300000 },
        { label: '₹3L - ₹5L', min: 300000, max: 500000 },
        { label: '₹5L - ₹10L', min: 500000, max: 1000000 },
        { label: 'Above ₹10L', min: 1000000, max: 10000000 }
      ]
    };
  }
};

/**
 * Fetch intelligent search suggestions from database
 * Includes vendors, service types, and cities
 */
export const fetchSearchSuggestions = async (query, limit = 10) => {
  try {
    if (!query || query.length < 2) return [];
    
    const response = await apiClient.get('/dynamic/search-suggestions', {
      params: { q: query, limit }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};

/**
 * Fetch filter statistics (counts) for UI display
 * Shows how many vendors match each filter option
 */
export const fetchFilterStats = async (city = null, serviceType = null) => {
  try {
    const params = {};
    if (city) params.city = city;
    if (serviceType) params.serviceType = serviceType;
    
    const response = await apiClient.get('/dynamic/filter-stats', { params });
    return response.data?.data || { verifiedCount: 0, ratingBreakdown: {}, totalCount: 0 };
  } catch (error) {
    console.error('Error fetching filter stats:', error);
    return { verified: 0, total: 0, ratingBreakdown: {} };
  }
};

export default {
  fetchServiceTypes,
  fetchCities,
  fetchPriceRanges,
  fetchSearchSuggestions,
  fetchFilterStats
};
