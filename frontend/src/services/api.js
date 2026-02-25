import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_ROOT = getApiUrl();

// Create axios instance with default config
// NOTE: increase timeout to 30s to avoid transient admin dashboard timeouts
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check both authToken (users/admins) and vendorToken (vendors)
    const token = localStorage.getItem('authToken') || localStorage.getItem('vendorToken');
    console.log('🔑 Request interceptor:', {
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token added to request headers');
    } else {
      console.warn('⚠️ No token found in localStorage for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    // Always log responses for admin debugging
    if (response.config.url?.includes('/admin/')) {
      console.log('✅ API Response:', response.config.url, response.data);
    }
    return response.data;
  },
  (error) => {
    // Enhanced error handling with detailed logging
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    console.error('❌ API Error:', {
      url,
      status,
      message: errorData?.message || error.message,
      error: errorData?.error
    });
    
    // Handle authentication errors
    if (status === 401) {
      const errorMessage = errorData?.error?.message || errorData?.message || 'Authentication required';
      const errorCode = errorData?.error?.code;
      
      console.error('🔒 Auth Error:', errorMessage, 'Code:', errorCode);
      
      // Only clear token and redirect on specific auth failures
      // Don't auto-logout on every 401 - let the component handle it
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
        console.warn('⚠️ Token invalid, clearing auth state');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        // Redirect to home instead of non-existent /login
        if (!window.location.pathname.includes('/admin')) {
          window.location.href = '/';
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle forbidden errors
    if (status === 403) {
      const errorMessage = errorData?.error?.message || errorData?.message || 'Access forbidden';
      console.error('🚫 Forbidden:', errorMessage);
      
      // If admin access denied, redirect to home
      if (url.includes('/admin/') && !window.location.pathname.includes('/admin')) {
        console.warn('⚠️ Admin access denied, redirecting to home');
        window.location.href = '/';
      }
      
      throw new Error(errorMessage);
    }
    
    const errorMessage = errorData?.error?.message || errorData?.message || error.message || 'An error occurred';
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

    // apiClient response interceptor returns `response.data`, so `response` is the body
    if (!response || !response.success) {
      console.error('Search failed:', response);
    }

    return {
      vendors: response && response.success ? response.results : [],
      total: response && response.success ? response.total : 0,
      tierBreakdown: response && response.success ? response.searchQuality?.tierBreakdown : null,
      metadata: response && response.success ? response.metadata : null
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
    console.log('📊 Fetching pending inquiries...');
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/inquiries/pending?${queryParams}`);
    console.log('✅ Pending inquiries response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching pending inquiries:', error);
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
    console.log('✅ Approving inquiry:', inquiryId);
    const response = await apiClient.post(`/admin/inquiries/${inquiryId}/approve`);
    console.log('✅ Approve response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error approving inquiry:', error);
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
    console.log('❌ Rejecting inquiry:', inquiryId, reason);
    const response = await apiClient.post(`/admin/inquiries/${inquiryId}/reject`, { reason });
    console.log('✅ Reject response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error rejecting inquiry:', error);
    throw error;
  }
};

/**
 * ADMIN: Get inquiry approval statistics
 * @returns {Promise<Object>} Statistics object with pending, approved, rejected counts
 */
export const fetchInquiryApprovalStats = async () => {
  try {
    console.log('📊 Fetching inquiry approval stats...');
    const response = await apiClient.get('/admin/inquiries/approval-stats');
    console.log('✅ Approval stats response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching approval stats:', error);
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
    console.log('📊 Fetching admin stats...');
    // Retry on timeout up to 2 times with small backoff
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await apiClient.get('/admin/stats', {
          timeout: 30000
        });
        console.log('✅ Admin stats response:', response);
        // Response interceptor already returns response.data
        // Backend structure: { success: true, data: {...} }
        return response && response.success ? response.data : response;
      } catch (err) {
        const msg = err.message || '';
        console.error(`❌ Attempt ${attempt} failed:`, msg);
        if (attempt === maxAttempts || !/timeout/i.test(msg)) {
          throw err;
        }
        // small delay before retry
        await new Promise(res => setTimeout(res, 500 * attempt));
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
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
    console.log('📊 Fetching recent activity...');
    const response = await apiClient.get(`/admin/activity?limit=${limit}`, {
      timeout: 30000
    });
    console.log('✅ Recent activity response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
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
    console.log('👥 Fetching all users...');
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/users?${queryString}`);
    console.log('✅ Users response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
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
    console.log('✏️ Updating user status:', userId, updates);
    const response = await apiClient.patch(`/admin/users/${userId}`, updates);
    console.log('✅ Update user response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error updating user status:', error);
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
    console.log('🏢 Fetching all vendors with params:', params);
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/vendors?${queryString}`);
    console.log('✅ Vendors response:', response);
    // Return consistent structure - response already has { success, data }
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    throw error;
  }
};

/**
 * ADMIN: Get single vendor by ID (includes inactive vendors)
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Vendor object
 */
export const fetchVendorByIdAdmin = async (vendorId) => {
  try {
    console.log('🏢 Fetching vendor by ID:', vendorId);
    const response = await apiClient.get(`/admin/vendors/${vendorId}`);
    console.log('✅ Vendor response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching vendor:', error);
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
    console.log('✏️ Toggling vendor verification:', vendorId, verified);
    const response = await apiClient.patch(
      `/admin/vendors/${vendorId}/verify`,
      { verified }
    );
    console.log('✅ Verification response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error toggling vendor verification:', error);
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
    console.log('✏️ Toggling vendor status:', vendorId, isActive);
    const response = await apiClient.patch(
      `/admin/vendors/${vendorId}/status`,
      { isActive }
    );
    console.log('✅ Status response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error toggling vendor status:', error);
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
    console.log('🗑️ Deleting vendor:', vendorId);
    const response = await apiClient.delete(`/admin/vendors/${vendorId}`);
    console.log('✅ Delete response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting vendor:', error);
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
/**
 * ADMIN: Forward inquiry to a different vendor
 * @param {string} inquiryId - Inquiry ID
 * @param {string} newVendorId - New vendor ID
 * @param {string} reason - Reason for forwarding
 * @returns {Promise<Object>} Updated inquiry
 */
export const forwardInquiry = async (inquiryId, newVendorId, reason) => {
  try {
    console.log('➡️ Forwarding inquiry:', inquiryId, 'to vendor:', newVendorId);
    const response = await apiClient.post(
      `/admin/inquiries/${inquiryId}/forward`,
      { newVendorId, reason }
    );
    console.log('✅ Forward response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error forwarding inquiry:', error);
    throw error;
  }
};

/**
 * ADMIN: Toggle inquiry active/inactive status
 * @param {string} inquiryId - Inquiry ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated inquiry
 */
/**
 * ADMIN: Toggle inquiry active status
 * @param {string} inquiryId - Inquiry ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated inquiry
 */
export const toggleInquiryActive = async (inquiryId, isActive) => {
  try {
    console.log('✏️ Toggling inquiry active status:', inquiryId, isActive);
    const response = await apiClient.patch(
      `/admin/inquiries/${inquiryId}/toggle-active`,
      { isActive }
    );
    console.log('✅ Toggle active response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error toggling inquiry status:', error);
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
    console.log('📧 Fetching all inquiries with params:', params);
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/inquiries?${queryString}`);
    console.log('✅ Inquiries response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error fetching inquiries:', error);
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
    console.log('✏️ Updating inquiry status:', inquiryId, updates);
    const response = await apiClient.patch(
      `/admin/inquiries/${inquiryId}`,
      updates
    );
    console.log('✅ Update inquiry response:', response);
    return response && response.success ? response.data : response;
  } catch (error) {
    console.error('❌ Error updating inquiry:', error);
    throw error;
  }
};

/**
 * ==========================================
 * REVIEW MANAGEMENT (ADMIN)
 * ==========================================
 */

/**
 * Get all reviews with filters (Admin)
 */
export const fetchAllReviewsAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    console.log('📋 Fetching all reviews (Admin):', queryParams.toString());
    const response = await apiClient.get(`/admin/reviews?${queryParams.toString()}`);
    console.log('✅ Reviews data received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    throw error;
  }
};

/**
 * Get review statistics (Admin)
 */
export const fetchReviewStats = async () => {
  try {
    console.log('📊 Fetching review stats...');
    const response = await apiClient.get('/admin/reviews/stats');
    console.log('✅ Review stats received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching review stats:', error);
    throw error;
  }
};

/**
 * Get pending reviews (Admin)
 */
export const fetchPendingReviews = async () => {
  try {
    console.log('⏳ Fetching pending reviews...');
    const response = await apiClient.get('/admin/reviews/pending');
    console.log('✅ Pending reviews received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching pending reviews:', error);
    throw error;
  }
};

/**
 * Approve a review (Admin)
 */
export const approveReviewAdmin = async (reviewId) => {
  try {
    console.log('✅ Approving review:', reviewId);
    const response = await apiClient.post(`/admin/reviews/${reviewId}/approve`);
    console.log('✅ Review approved:', response);
    return response;
  } catch (error) {
    console.error('❌ Error approving review:', error);
    throw error;
  }
};

/**
 * Reject a review (Admin)
 */
export const rejectReviewAdmin = async (reviewId, reason) => {
  try {
    console.log('❌ Rejecting review:', reviewId);
    const response = await apiClient.post(`/admin/reviews/${reviewId}/reject`, { reason });
    console.log('✅ Review rejected:', response);
    return response;
  } catch (error) {
    console.error('❌ Error rejecting review:', error);
    throw error;
  }
};

/**
 * Delete a review (Admin)
 */
export const deleteReviewAdmin = async (reviewId) => {
  try {
    console.log('🗑️ Deleting review:', reviewId);
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    console.log('✅ Review deleted:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    throw error;
  }
};

/**
 * ========================================
 * MEDIA MANAGEMENT (Admin)
 * ========================================
 */

/**
 * Get all media with filters (Admin)
 */
export const fetchAllMediaAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.approvalStatus && params.approvalStatus !== 'all') queryParams.append('approvalStatus', params.approvalStatus);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    console.log('📸 Fetching all media (Admin):', queryParams.toString());
    const response = await apiClient.get(`/admin/media?${queryParams.toString()}`);
    console.log('✅ Media data received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching media:', error);
    throw error;
  }
};

/**
 * Get media statistics (Admin)
 */
export const fetchMediaStats = async () => {
  try {
    console.log('📊 Fetching media stats...');
    const response = await apiClient.get('/admin/media/stats');
    console.log('✅ Media stats received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching media stats:', error);
    throw error;
  }
};

/**
 * Get pending media (Admin)
 */
export const fetchPendingMedia = async () => {
  try {
    console.log('⏳ Fetching pending media...');
    const response = await apiClient.get('/admin/media/pending');
    console.log('✅ Pending media received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching pending media:', error);
    throw error;
  }
};

/**
 * Approve media (Admin)
 */
export const approveMediaAdmin = async (mediaId) => {
  try {
    console.log('✅ Approving media:', mediaId);
    const response = await apiClient.post(`/admin/media/${mediaId}/approve`);
    console.log('✅ Media approved:', response);
    return response;
  } catch (error) {
    console.error('❌ Error approving media:', error);
    throw error;
  }
};

/**
 * Reject media (Admin)
 */
export const rejectMediaAdmin = async (mediaId, reason) => {
  try {
    console.log('❌ Rejecting media:', mediaId);
    const response = await apiClient.post(`/admin/media/${mediaId}/reject`, { reason });
    console.log('✅ Media rejected:', response);
    return response;
  } catch (error) {
    console.error('❌ Error rejecting media:', error);
    throw error;
  }
};

/**
 * Delete media (Admin)
 */
export const deleteMediaAdmin = async (mediaId) => {
  try {
    console.log('🗑️ Deleting media:', mediaId);
    const response = await apiClient.delete(`/admin/media/${mediaId}`);
    console.log('✅ Media deleted:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting media:', error);
    throw error;
  }
};

/**
 * ========================================
 * BLOG MANAGEMENT (Admin)
 * ========================================
 */

/**
 * Get all vendor blogs with filters (Admin)
 */
export const fetchAllBlogsAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.approvalStatus && params.approvalStatus !== 'all') queryParams.append('approvalStatus', params.approvalStatus);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    console.log('📝 Fetching all blogs (Admin):', queryParams.toString());
    const response = await apiClient.get(`/admin/vendor-blogs?${queryParams.toString()}`);
    console.log('✅ Blogs data received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    throw error;
  }
};

/**
 * Get blog statistics (Admin)
 */
export const fetchBlogStats = async () => {
  try {
    console.log('📊 Fetching blog stats...');
    const response = await apiClient.get('/admin/vendor-blogs/stats');
    console.log('✅ Blog stats received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blog stats:', error);
    throw error;
  }
};

/**
 * Get pending blogs (Admin)
 */
export const fetchPendingBlogs = async () => {
  try {
    console.log('⏳ Fetching pending blogs...');
    const response = await apiClient.get('/admin/vendor-blogs/pending');
    console.log('✅ Pending blogs received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching pending blogs:', error);
    throw error;
  }
};

/**
 * Approve blog (Admin)
 */
export const approveBlogAdmin = async (blogId) => {
  try {
    console.log('✅ Approving blog:', blogId);
    const response = await apiClient.post(`/admin/vendor-blogs/${blogId}/approve`);
    console.log('✅ Blog approved:', response);
    return response;
  } catch (error) {
    console.error('❌ Error approving blog:', error);
    throw error;
  }
};

/**
 * Reject blog (Admin)
 */
export const rejectBlogAdmin = async (blogId, reason) => {
  try {
    console.log('❌ Rejecting blog:', blogId);
    const response = await apiClient.post(`/admin/vendor-blogs/${blogId}/reject`, { reason });
    console.log('✅ Blog rejected:', response);
    return response;
  } catch (error) {
    console.error('❌ Error rejecting blog:', error);
    throw error;
  }
};

/**
 * Delete blog (Admin)
 */
export const deleteBlogAdmin = async (blogId) => {
  try {
    console.log('🗑️ Deleting blog:', blogId);
    const response = await apiClient.delete(`/admin/vendor-blogs/${blogId}`);
    console.log('✅ Blog deleted:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    throw error;
  }
};

// Export the axios instance for custom requests
export default apiClient;
