/**
 * API configuration helpers.
 * Ensures every call uses the same host that comes from Vite env variables.
 */

const normalizeBaseUrl = (input) => {
  if (!input) return 'http://localhost:5000';
  return input.trim().replace(/\/+$/, '');
};

// Get base URL from env - it may or may not include /api
const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

// Check if the env URL already includes /api
const hasApiPath = envUrl.endsWith('/api');

// Export the base API URL (with /api)
export const API_BASE_URL = hasApiPath ? envUrl : `${envUrl}/api`;

// Get full API URL for an endpoint
export const getApiUrl = (endpoint = '') => {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return cleanEndpoint ? `${API_BASE_URL}/${cleanEndpoint}` : API_BASE_URL;
};

// Get absolute URL (without /api prefix)
export const getAbsoluteUrl = (path = '') => {
  const baseWithoutApi = hasApiPath ? envUrl.replace(/\/api$/, '') : envUrl;
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${baseWithoutApi}/${cleanPath}` : baseWithoutApi;
};

export default API_BASE_URL;
