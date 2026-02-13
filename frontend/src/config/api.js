/**
 * API configuration helpers.
 * Ensures every call uses the same host that comes from Vite env variables.
 */

const normalizeBaseUrl = (input) => {
  if (!input) return 'http://localhost:5000';
  return input.trim().replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const getApiUrl = (endpoint = '') => {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${API_BASE_URL}/api${cleanEndpoint ? `/${cleanEndpoint}` : ''}`;
};

export const getAbsoluteUrl = (path = '') => {
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${API_BASE_URL}/${cleanPath}` : API_BASE_URL;
};

export default API_BASE_URL;
