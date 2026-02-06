import axios from 'axios';

// Base API URL - configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
);

/**
 * TAXONOMY API - Single Source of Truth
 * Fetch services grouped by category from database
 * @returns {Promise<Array>} Array of services with {value, label, icon, category}
 */
export const fetchServicesByCategory = async () => {
  try {
    const response = await apiClient.get('/services/categories');
    return response.success ? response.services : [];
  } catch (error) {
    console.error('Error fetching services by category:', error);
    return [];
  }
};

/**
 * Fetch vendors with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.eventCategory - Event category filter (Wedding, Corporate, Private, Religious, Others)
 * @param {string} filters.eventSubType - Event sub-type filter (Engagement, Conference, Birthday, etc.)
 * @param {string} filters.city - City filter
 * @param {number} filters.latitude - User latitude for location-based search
 * @param {number} filters.longitude - User longitude for location-based search
 * @param {number} filters.radius - Search radius in kilometers
 * @param {number} filters.budgetMin - Minimum budget
 * @param {number} filters.budgetMax - Maximum budget
 * @returns {Promise<Object>} Object with vendors array and total count
 */
export const fetchVendors = async (filters = {}) => {
  try {
    const searchPayload = {
      page: filters.page || 1,
      limit: filters.limit || 30,
      sort: filters.sortBy || 'relevance'
    };

    // Text query - maps to 'query' field in backend
    if (filters.query && filters.query.trim()) {
      searchPayload.query = filters.query.trim();
    }

    // Service type - maps to 'serviceId' field
    if (filters.serviceType && filters.serviceType.trim()) {
      searchPayload.serviceId = filters.serviceType.trim().toLowerCase();
    }

    // Location object - always add if city/area present or has coordinates
    const hasLocation = filters.city || filters.area || (filters.latitude && filters.longitude);
    if (hasLocation) {
      searchPayload.location = {};
      
      if (filters.city && filters.city.trim()) {
        searchPayload.location.city = filters.city.trim();
      }
      if (filters.area && filters.area.trim()) {
        searchPayload.location.area = filters.area.trim();
      }
      if (filters.latitude && filters.longitude) {
        searchPayload.location.latitude = parseFloat(filters.latitude);
        searchPayload.location.longitude = parseFloat(filters.longitude);
        searchPayload.location.radius = parseFloat(filters.radius) || 10;
      }
    }

    // Budget object - only add if min or max exists
    if (filters.budgetMin || filters.budgetMax) {
      searchPayload.budget = {};
      if (filters.budgetMin) searchPayload.budget.min = parseFloat(filters.budgetMin);
      if (filters.budgetMax) searchPayload.budget.max = parseFloat(filters.budgetMax);
    }

    // Additional filters
    if (filters.verified !== undefined && filters.verified !== null && filters.verified !== '') {
      searchPayload.verified = filters.verified === true || filters.verified === 'true';
    }
    
    if (filters.rating && parseFloat(filters.rating) > 0) {
      searchPayload.rating = parseFloat(filters.rating);
    }

    const response = await apiClient.post('/search', searchPayload);
    
    if (!response.success) {
      console.error('Search failed:', response);
    }
    
    return {
      vendors: response.success ? response.data.results : [],
      total: response.success ? response.data.total : 0
    };
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    return { vendors: [], total: 0 };
  }
};

/**
 * Fetch a single vendor by ID
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Vendor object
 */
export const fetchVendorById = async (vendorId) => {
  try {
    const response = await apiClient.get(`/vendors/${vendorId}`);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }
};

/**
 * Send inquiry to a vendor
 * @param {Object} inquiryData - Inquiry information
 * @param {string} inquiryData.userName - Customer name
 * @param {string} inquiryData.userContact - Customer contact (phone)
 * @param {number} inquiryData.budget - Event budget
 * @param {Object} inquiryData.location - GeoJSON Point location
 * @param {string} inquiryData.eventType - Type of event
 * @param {string} inquiryData.vendorID - Target vendor ID
 * @returns {Promise<Object>} Created inquiry object
 */
export const sendInquiry = async (inquiryData) => {
  try {
    const response = await apiClient.post('/inquiries', inquiryData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error sending inquiry:', error);
    throw error;
  }
};

/**
 * Fetch all inquiries for a specific vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} Array of inquiry objects
 */
export const fetchVendorInquiries = async (vendorId) => {
  try {
    const response = await apiClient.get(`/inquiries/vendor/${vendorId}`);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching vendor inquiries:', error);
    throw error;
  }
};

/**
 * Fetch all inquiries (Admin only)
 * @returns {Promise<Array>} Array of all inquiry objects
 */
export const fetchAllInquiries = async () => {
  try {
    const response = await apiClient.get('/inquiries');
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching all inquiries:', error);
    throw error;
  }
};

/**
 * Fetch a single inquiry by ID
 * @param {string} inquiryId - Inquiry ID
 * @returns {Promise<Object>} Inquiry object
 */
export const fetchInquiryById = async (inquiryId) => {
  try {
    const response = await apiClient.get(`/inquiries/${inquiryId}`);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    throw error;
  }
};

/**
 * Update inquiry status
 * @param {string} inquiryId - Inquiry ID
 * @param {string} status - New status ('pending', 'sent', 'responded')
 * @returns {Promise<Object>} Updated inquiry object
 */
export const updateInquiryStatus = async (inquiryId, status) => {
  try {
    const response = await apiClient.patch(`/inquiries/${inquiryId}/status`, { status });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};

/**
 * Delete inquiry by ID
 * @param {string} inquiryId - Inquiry ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteInquiry = async (inquiryId) => {
  try {
    const response = await apiClient.delete(`/inquiries/${inquiryId}`);
    return response;
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
};

/**
 * ADMIN: Fetch pending inquiries awaiting approval
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Object with inquiries array and pagination
 */
export const fetchPendingInquiries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/inquiries/pending?${queryParams}`);
    return response.success ? response.data : { inquiries: [], total: 0 };
  } catch (error) {
    console.error('Error fetching pending inquiries:', error);
    throw error;
  }
};

/**
 * ADMIN: Approve an inquiry (allows vendor to see it)
 * @param {string} inquiryId - Inquiry ID
 * @returns {Promise<Object>} Approved inquiry object
 */
export const approveInquiry = async (inquiryId) => {
  try {
    const response = await apiClient.post(`/admin/inquiries/${inquiryId}/approve`);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error approving inquiry:', error);
    throw error;
  }
};

/**
 * ADMIN: Reject an inquiry with reason (vendor won't see it)
 * @param {string} inquiryId - Inquiry ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejected inquiry object
 */
export const rejectInquiry = async (inquiryId, reason) => {
  try {
    const response = await apiClient.post(`/admin/inquiries/${inquiryId}/reject`, { reason });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error rejecting inquiry:', error);
    throw error;
  }
};

/**
 * ADMIN: Get inquiry approval statistics
 * @returns {Promise<Object>} Statistics object with pending, approved, rejected counts
 */
export const fetchInquiryApprovalStats = async () => {
  try {
    const response = await apiClient.get('/admin/inquiries/approval-stats');
    return response.success ? response.data : { pending: 0, approved: 0, rejected: 0, total: 0 };
  } catch (error) {
    console.error('Error fetching approval stats:', error);
    throw error;
  }
};

/**
 * Create a new vendor
 * @param {Object} vendorData - Vendor information
 * @returns {Promise<Object>} Created vendor object
 */
export const createVendor = async (vendorData) => {
  try {
    const response = await apiClient.post('/vendors', vendorData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

/**
 * Update vendor by ID
 * @param {string} vendorId - Vendor ID
 * @param {Object} vendorData - Updated vendor data
 * @returns {Promise<Object>} Updated vendor object
 */
export const updateVendor = async (vendorId, vendorData) => {
  try {
    const response = await apiClient.put(`/vendors/${vendorId}`, vendorData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

/**
 * Delete vendor by ID
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteVendor = async (vendorId) => {
  try {
    const response = await apiClient.delete(`/vendors/${vendorId}`);
    return response;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

// ==========================================
// ADDITIONAL ADMIN API ENDPOINTS
// ==========================================

/**
 * ADMIN: Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export const fetchAdminStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * ADMIN: Get recent activity
 * @param {number} limit - Number of items to fetch
 * @returns {Promise<Object>} Recent activity data
 */
export const fetchRecentActivity = async (limit = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get(`/admin/activity?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

/**
 * ADMIN: Get all users
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Users data
 */
export const fetchAllUsers = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/users?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * ADMIN: Update user status
 * @param {string} userId - User ID
 * @param {Object} updates - Status updates (isActive, role)
 * @returns {Promise<Object>} Updated user
 */
export const updateUserStatus = async (userId, updates) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch(`/admin/users/${userId}`, updates, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * ADMIN: Get all vendors
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Vendors data
 */
export const fetchAllVendorsAdmin = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/vendors?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

/**
 * ADMIN: Toggle vendor verification status
 * @param {string} vendorId - Vendor ID
 * @param {boolean} verified - Verification status
 * @returns {Promise<Object>} Updated vendor
 */
export const toggleVendorVerification = async (vendorId, verified) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch(
      `/admin/vendors/${vendorId}/verify`,
      { verified },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error toggling vendor verification:', error);
    throw error;
  }
};

/**
 * ADMIN: Toggle vendor active status (hide/show)
 * @param {string} vendorId - Vendor ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated vendor
 */
export const toggleVendorStatus = async (vendorId, isActive) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch(
      `/admin/vendors/${vendorId}/status`,
      { isActive },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error toggling vendor status:', error);
    throw error;
  }
};

/**
 * ADMIN: Delete vendor permanently
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteVendorPermanent = async (vendorId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete(`/admin/vendors/${vendorId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

/**
 * ADMIN: Forward inquiry to different vendor
 * @param {string} inquiryId - Inquiry ID
 * @param {string} newVendorId - New vendor ID
 * @param {string} reason - Reason for forwarding
 * @returns {Promise<Object>} Updated inquiry
 */
export const forwardInquiry = async (inquiryId, newVendorId, reason) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(
      `/admin/inquiries/${inquiryId}/forward`,
      { newVendorId, reason },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    console.error('Error forwarding inquiry:', error);
    throw error;
  }
};

/**
 * ADMIN: Toggle inquiry active/inactive status
 * @param {string} inquiryId - Inquiry ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated inquiry
 */
export const toggleInquiryActive = async (inquiryId, isActive) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch(
      `/admin/inquiries/${inquiryId}/toggle-active`,
      { isActive },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    console.error('Error toggling inquiry status:', error);
    throw error;
  }
};

/**
 * ADMIN: Get all inquiries
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Inquiries data
 */
export const fetchAllInquiriesAdmin = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/inquiries?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
};

/**
 * ADMIN: Update inquiry status
 * @param {string} inquiryId - Inquiry ID
 * @param {Object} updates - Status updates
 * @returns {Promise<Object>} Updated inquiry
 */
export const updateInquiryStatusAdmin = async (inquiryId, updates) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch(
      `/admin/inquiries/${inquiryId}`,
      updates,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
};

// Export the axios instance for custom requests
export default apiClient;
