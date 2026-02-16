# Migration Guide: Updating to New Validation System

## Overview

This guide helps you update existing code to work with the new production-grade validation and UX safeguard system.

---

## 🔄 For Components Using Vendor Authentication

### Before (Manual localStorage Checks)

```jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const navigate = useNavigate();
  
  // Manual authentication check
  const vendorToken = localStorage.getItem('vendorToken');
  const vendorId = localStorage.getItem('vendorId');
  
  useEffect(() => {
    if (!vendorToken || !vendorId) {
      navigate('/');
    }
  }, [vendorToken, vendorId, navigate]);

  // Rest of component...
};
```

### After (Using VendorAuthContext)

```jsx
import React from 'react';
import { useVendorAuth } from '../contexts/VendorAuthContext';

const VendorDashboard = () => {
  // No manual checks needed - VendorProtectedRoute handles it
  const { vendor, vendorToken, isVendorAuthenticated } = useVendorAuth();
  
  // Access vendor data directly
  console.log(vendor.businessName);
  console.log(vendor.email);
  
  // Rest of component...
};
```

**Note**: The route should already be wrapped in `VendorProtectedRoute`, so manual checks are unnecessary.

---

## 🔄 For Components Using User/Admin Authentication

### Before (Inconsistent Checks)

```jsx
const MyComponent = () => {
  const user = JSON.parse(localStorage.getItem('authUser'));
  const token = localStorage.getItem('authToken');
  
  if (!user || !token) {
    return <Navigate to="/" />;
  }
  
  // Component logic
};
```

### After (Using AuthContext)

```jsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, token, isAuthenticated, isAdmin } = useAuth();
  
  // No need for manual checks - ProtectedRoute handles it
  
  // Use auth helpers
  if (isAdmin()) {
    // Admin-specific logic
  }
  
  // Component logic
};
```

---

## 🔄 For Components Managing Search/Filters

### Before (Manual State Management)

```jsx
const SearchPage = () => {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Manual cleanup
  useEffect(() => {
    return () => {
      // No cleanup - filters persist!
      setFilters({});
      setSearchQuery('');
    };
  }, []);
};
```

### After (Using SearchContext with Auto-Cleanup)

```jsx
import { useSearch } from '../contexts/SearchContext';

const SearchPage = () => {
  const { 
    filters, 
    searchQuery, 
    updateFilter, 
    clearAllFilters,
    resetSearchState 
  } = useSearch();
  
  // No manual cleanup needed - NavigationGuard handles it
  // Filters automatically clear when navigating away
  
  // Update filters easily
  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };
};
```

---

## 🔄 App.jsx Migration

### Before

```jsx
function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            {/* Other routes */}
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}
```

### After

```jsx
import { VendorAuthProvider } from './contexts/VendorAuthContext';
import VendorProtectedRoute from './components/VendorProtectedRoute';
import NavigationGuard from './components/NavigationGuard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <VendorAuthProvider>
          <SearchProvider>
            <NavigationGuard />
            <ScrollToTop />
            <Routes>
              <Route 
                path="/vendor-dashboard" 
                element={
                  <VendorProtectedRoute>
                    <VendorDashboard />
                  </VendorProtectedRoute>
                } 
              />
              {/* Other routes */}
            </Routes>
          </SearchProvider>
        </VendorAuthProvider>
      </AuthProvider>
    </Router>
  );
}
```

---

## 🔄 Adding New Protected Routes

### User/Admin Protected Route

```jsx
// Import
import ProtectedRoute from './components/ProtectedRoute';

// In Routes
<Route 
  path="/new-user-page" 
  element={
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      <NewUserPage />
    </ProtectedRoute>
  } 
/>
```

### Vendor Protected Route

```jsx
// Import
import VendorProtectedRoute from './components/VendorProtectedRoute';

// In Routes
<Route 
  path="/new-vendor-page" 
  element={
    <VendorProtectedRoute>
      <NewVendorPage />
    </VendorProtectedRoute>
  } 
/>
```

---

## 🔄 Vendor Login/Logout Implementation

### Before (Manual Implementation)

```jsx
const VendorLogin = () => {
  const handleLogin = async (email, password) => {
    const response = await fetch('/api/vendors/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    // Manual storage
    localStorage.setItem('vendorToken', data.token);
    localStorage.setItem('vendorId', data.vendor._id);
    localStorage.setItem('vendorData', JSON.stringify(data.vendor));
    
    // Manual navigation
    navigate('/vendor-dashboard');
  };
};
```

### After (Using VendorAuthContext)

```jsx
import { useVendorAuth } from '../contexts/VendorAuthContext';

const VendorLogin = () => {
  const { loginVendor } = useVendorAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await loginVendor(email, password);
      // Context handles storage and navigation automatically
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };
};
```

### Logout

```jsx
import { useVendorAuth } from '../contexts/VendorAuthContext';

const VendorHeader = () => {
  const { logoutVendor } = useVendorAuth();
  
  const handleLogout = () => {
    logoutVendor(); // Clears all vendor data and redirects
  };
};
```

---

## 🔄 Search Filter Reset Logic

### Before (Manual Cleanup in Each Component)

```jsx
const SearchResults = () => {
  const [localFilters, setLocalFilters] = useState({});
  
  useEffect(() => {
    // Manual cleanup
    return () => {
      setLocalFilters({});
    };
  }, []);
  
  const handleNavigateAway = () => {
    setLocalFilters({}); // Manual reset
    navigate('/home');
  };
};
```

### After (Automatic via NavigationGuard)

```jsx
import { useSearch } from '../contexts/SearchContext';

const SearchResults = () => {
  const { filters, resetSearchState } = useSearch();
  
  // No manual cleanup needed - NavigationGuard auto-clears
  
  const handleNavigateAway = () => {
    navigate('/home'); // NavigationGuard handles reset
  };
  
  // Optional: Manual reset if needed
  const handleManualReset = () => {
    resetSearchState();
  };
};
```

---

## 🔄 Protected Page Without Flash

### Before (Page Loads Then Redirects)

```jsx
const AdminPanel = () => {
  const [isAuth, setIsAuth] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    } else {
      setIsAuth(true);
    }
  }, []);
  
  if (!isAuth) return <div>Loading...</div>;
  
  return <div>Admin Panel Content</div>; // Shows briefly before redirect
};
```

### After (No Flash)

```jsx
// In App.jsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>

// AdminPanel.jsx - No auth checks needed
const AdminPanel = () => {
  // Component only renders if authenticated
  return <div>Admin Panel Content</div>;
};
```

---

## 🔄 Testing Your Migration

### Checklist

- [ ] Remove manual `localStorage` checks from components
- [ ] Replace with `useAuth()` or `useVendorAuth()` hooks
- [ ] Wrap protected routes in `ProtectedRoute` or `VendorProtectedRoute`
- [ ] Remove manual filter cleanup logic
- [ ] Test authentication flows
- [ ] Test navigation and filter resets
- [ ] Verify no page flash on protected routes
- [ ] Check browser back/forward behavior

### Test Commands

```bash
# 1. Clear all browser data
# Open DevTools → Application → Clear storage

# 2. Test unauthenticated access
# Navigate to /admin or /vendor-dashboard
# Should redirect to /

# 3. Test filter reset
# Go to /search, apply filters, navigate to /about
# Go back to /search, filters should be cleared

# 4. Test page refresh
# Apply filters on /search, refresh page
# Filters should reset

# 5. Test browser back button
# Search → apply filters → go to /contact
# Press back button
# Filters should be cleared
```

---

## 🚨 Breaking Changes

### 1. Vendor Routes Now Require Authentication

**Impact**: Direct access to `/vendor-dashboard` or `/vendor-profile-dashboard` without login now redirects to `/`

**Migration**: Ensure all vendor login flows properly set vendor auth data

### 2. Filters Auto-Clear on Navigation

**Impact**: Filters no longer persist when navigating from search to non-search pages

**Migration**: If you need to preserve filters for a specific route, add it to `SEARCH_ROUTES` in `NavigationGuard.jsx`

### 3. Context Provider Hierarchy Changed

**Impact**: New `VendorAuthProvider` added between `AuthProvider` and `SearchProvider`

**Migration**: Update any code that relies on context order (rare)

---

## 📝 Code Review Checklist

Before merging your migration:

- [ ] No direct `localStorage` access for auth tokens
- [ ] All protected routes wrapped in appropriate guards
- [ ] No manual navigation after auth actions
- [ ] No manual filter cleanup in components
- [ ] All vendor pages use `useVendorAuth()`
- [ ] All user/admin pages use `useAuth()`
- [ ] No page flash on protected routes
- [ ] Browser back/forward works correctly

---

## 🆘 Common Migration Issues

### Issue: "Cannot read property 'vendor' of null"

**Cause**: Trying to access vendor before context loads

**Solution**:
```jsx
const { vendor, loading } = useVendorAuth();

if (loading) return <Loader />;
if (!vendor) return null;

// Safe to use vendor here
```

### Issue: Filters not clearing after migration

**Cause**: Using local state instead of SearchContext

**Solution**:
```jsx
// ❌ Don't use local state for filters
const [filters, setFilters] = useState({});

// ✅ Use SearchContext
const { filters, updateFilter } = useSearch();
```

### Issue: Redirect loop on protected route

**Cause**: Incorrect `allowedRoles` configuration

**Solution**:
```jsx
// Check user role matches
<ProtectedRoute allowedRoles={['user', 'admin']}>
  <UserDashboard />
</ProtectedRoute>
```

---

## 📞 Support

If you encounter issues during migration:

1. Check [PRODUCTION_VALIDATION_GUIDE.md](PRODUCTION_VALIDATION_GUIDE.md)
2. Review [VALIDATION_QUICK_REFERENCE.md](VALIDATION_QUICK_REFERENCE.md)
3. Clear browser cache and localStorage
4. Test in incognito/private mode

---

**Migration Status Template**:

```markdown
## Migration Checklist

### Components Updated
- [ ] VendorDashboard
- [ ] VendorProfileDashboard
- [ ] AdminPanel
- [ ] UserDashboard
- [ ] SearchResults
- [ ] (Add your components)

### Routes Updated
- [ ] /vendor-dashboard
- [ ] /vendor-profile-dashboard
- [ ] /admin
- [ ] /dashboard
- [ ] (Add your routes)

### Tests Completed
- [ ] Authentication flows
- [ ] Protected routes
- [ ] Filter reset behavior
- [ ] Browser navigation
- [ ] Page refresh

### Issues Found
- (List any issues)

### Notes
- (Migration notes)
```
