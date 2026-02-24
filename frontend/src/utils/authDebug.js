/**
 * Auth Debug Utilities
 * Run these functions in browser console to debug authentication issues
 */

/**
 * Check authentication status
 * Usage in console: window.checkAuth()
 */
export const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('authUser');
  
  console.log('\n========== AUTH STATUS ==========');
  console.log('🔑 Token exists:', !!token);
  
  if (token) {
    console.log('📝 Token preview:', token.substring(0, 50) + '...');
    console.log('📏 Token length:', token.length);
    
    // Try to decode JWT (just the payload, no verification)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔓 Token payload:', payload);
        
        // Check expiration
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          const isExpired = expDate < now;
          
          console.log('⏰ Token expires:', expDate.toLocaleString());
          console.log('⏰ Current time:', now.toLocaleString());
          console.log(isExpired ? '❌ Token EXPIRED!' : '✅ Token valid');
        }
      }
    } catch (e) {
      console.log('⚠️ Could not decode token:', e.message);
    }
  } else {
    console.log('❌ No token found in localStorage');
  }
  
  console.log('\n👤 User exists:', !!userStr);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🎭 Role:', user.role);
      console.log('🆔 User ID:', user._id);
      console.log('✅ Is Active:', user.isActive);
    } catch (e) {
      console.log('❌ Could not parse user data:', e.message);
    }
  } else {
    console.log('❌ No user data found in localStorage');
  }
  
  console.log('================================\n');
  
  return {
    hasToken: !!token,
    hasUser: !!userStr,
    token: token ? token.substring(0, 50) + '...' : null
  };
};

/**
 * Clear all auth data
 * Usage in console: window.clearAuth()
 */
export const clearAuth = () => {
  console.log('🗑️ Clearing all auth data...');
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  console.log('✅ Auth data cleared. Refresh the page.');
};

/**
 * Manually set auth token (for testing)
 * Usage in console: window.setTestToken('your-token-here')
 */
export const setTestToken = (token) => {
  console.log('🔧 Setting test token...');
  localStorage.setItem('authToken', token);
  console.log('✅ Token set. Refresh the page.');
};

/**
 * Test API call with current token
 * Usage in console: window.testApiCall()
 */
export const testApiCall = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ No token found. Login first.');
    return;
  }
  
  console.log('🧪 Testing API call with current token...');
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('📊 Data:', data);
    } else {
      const error = await response.json();
      console.log('❌ API call failed');
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.checkAuth = checkAuth;
  window.clearAuth = clearAuth;
  window.setTestToken = setTestToken;
  window.testApiCall = testApiCall;
  
  console.log('🔧 Auth debug tools loaded! Available commands:');
  console.log('  - window.checkAuth() - Check authentication status');
  console.log('  - window.clearAuth() - Clear all auth data');
  console.log('  - window.setTestToken(token) - Set test token');
  console.log('  - window.testApiCall() - Test API call with current token');
}

export default {
  checkAuth,
  clearAuth,
  setTestToken,
  testApiCall
};
