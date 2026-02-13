/**
 * API Configuration
 * Centralized configuration for all API requests
 * Uses environment variables with fallback for development
 */

// Get API base URL from environment variable
// In production, set VITE_API_URL in your hosting platform's environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Export configured API URL
export const getApiUrl = (endpoint = '') => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Remove /api suffix from base URL if endpoint includes it
  const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
  
  // Return full URL
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
};

// Export base URL for legacy code
export default API_BASE_URL;
