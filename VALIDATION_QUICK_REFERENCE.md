# Quick Reference: Production Validations & UX Safeguards

## 🎯 What Was Implemented

### New Files Created
1. **VendorAuthContext.jsx** - Centralized vendor authentication
2. **VendorProtectedRoute.jsx** - Vendor route protection component
3. **NavigationGuard.jsx** - Automatic filter/state reset on navigation

### Updated Files
1. **App.jsx** - Added VendorAuthProvider, NavigationGuard, vendor route protection
2. **SearchContext.jsx** - Added `resetSearchState()` method

---

## 🔐 Authentication & Protected Routes

### For Users/Admins
```jsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (isAuthenticated()) {
    // User is logged in
    console.log(user.role); // 'user' or 'admin'
  }
};
```

### For Vendors
```jsx
import { useVendorAuth } from '../contexts/VendorAuthContext';

const MyComponent = () => {
  const { vendor, isVendorAuthenticated, loginVendor, logoutVendor } = useVendorAuth();
  
  if (isVendorAuthenticated()) {
    // Vendor is logged in
    console.log(vendor.businessName);
  }
};
```

---

## 🛡️ Protecting Routes

### User/Admin Route
```jsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### Vendor Route
```jsx
<Route 
  path="/vendor-dashboard" 
  element={
    <VendorProtectedRoute>
      <VendorDashboard />
    </VendorProtectedRoute>
  } 
/>
```

---

## 🔄 State Management

### Clear All Filters & Search State
```jsx
import { useSearch } from '../contexts/SearchContext';

const { resetSearchState } = useSearch();

// On some action
resetSearchState(); // Clears everything
```

### Clear Filters Only (Keep Location/Query)
```jsx
const { clearAllFilters } = useSearch();

clearAllFilters(); // Keeps location and search query
```

---

## 🧭 Navigation Behavior

### Automatic State Reset

**Filters are AUTO-CLEARED when leaving search pages:**
- `/search` → Any non-search page
- `/search-results` → Any non-search page
- On page refresh (non-search pages)
- On browser back/forward (non-search pages)

**Filters are PRESERVED when:**
- `/search` → `/search-results`
- Between any search pages
- Within the same page

### Search Routes (Filters Preserved)
```
/search
/search-results
/search-funnel
/search-dynamic
```

---

## 📱 Common Use Cases

### 1. Check if User is Authenticated
```jsx
const { isAuthenticated } = useAuth();

if (isAuthenticated()) {
  // Show user-specific content
}
```

### 2. Check if Vendor is Authenticated
```jsx
const { isVendorAuthenticated } = useVendorAuth();

if (isVendorAuthenticated()) {
  // Show vendor dashboard link
}
```

### 3. Logout User
```jsx
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Clears localStorage, redirects to /
};
```

### 4. Logout Vendor
```jsx
const { logoutVendor } = useVendorAuth();

const handleLogout = () => {
  logoutVendor(); // Clears vendor data, redirects to /
};
```

### 5. Get Current Filters
```jsx
const { filters, searchQuery, location } = useSearch();

console.log(filters.budgetMin); // e.g., 20000
console.log(searchQuery); // e.g., "photographer"
console.log(location); // e.g., "Delhi"
```

### 6. Update Filters
```jsx
const { updateFilter, updateFilters } = useSearch();

// Single filter
updateFilter('rating', 4.5);

// Multiple filters
updateFilters({
  budgetMin: 10000,
  budgetMax: 50000,
  verified: true
});
```

---

## ⚡ Quick Debugging

### Check Authentication Status (Console)
```javascript
// User/Admin
localStorage.getItem('authToken')
localStorage.getItem('authUser')

// Vendor
localStorage.getItem('vendorToken')
localStorage.getItem('vendorId')
localStorage.getItem('vendorData')
```

### Clear All Auth (Console)
```javascript
// Clear user/admin auth
localStorage.removeItem('authToken');
localStorage.removeItem('authUser');

// Clear vendor auth
localStorage.removeItem('vendorToken');
localStorage.removeItem('vendorId');
localStorage.removeItem('vendorData');
localStorage.removeItem('vendorBusinessName');
localStorage.removeItem('vendorEmail');

// Reload page
location.reload();
```

---

## 🧪 Testing Checklist

### Authentication Tests
- [ ] Try accessing `/admin` without login → Should redirect to `/`
- [ ] Login as user, try `/admin` → Should redirect to `/dashboard`
- [ ] Login as admin, access `/admin` → Should work
- [ ] Try accessing `/vendor-dashboard` without vendor login → Should redirect to `/`
- [ ] Login as vendor, access `/vendor-dashboard` → Should work

### Navigation Tests
- [ ] Apply filters on `/search`, navigate to `/about` → Filters should clear
- [ ] Apply filters on `/search`, navigate to `/search-results` → Filters should persist
- [ ] Apply filters, refresh page on `/search` → Filters should clear
- [ ] Use browser back button from `/search` to `/` → Filters should clear

---

## 🔗 Important Contexts

### AuthContext (User/Admin)
```javascript
{
  user,           // Current user object
  token,          // Auth token
  loading,        // Loading state
  login,          // Login function
  logout,         // Logout function
  isAuthenticated // Check auth status
}
```

### VendorAuthContext (Vendor)
```javascript
{
  vendor,                // Current vendor object
  vendorToken,           // Vendor auth token
  loading,               // Loading state
  loginVendor,           // Vendor login function
  logoutVendor,          // Vendor logout function
  isVendorAuthenticated  // Check vendor auth status
}
```

### SearchContext (Filters & Search)
```javascript
{
  searchQuery,        // Current search query
  filters,            // All active filters
  location,           // Selected location
  resetSearchState,   // Clear everything
  clearAllFilters,    // Clear filters only
  updateFilter,       // Update single filter
  updateFilters       // Update multiple filters
}
```

---

## 🆘 Common Issues

### Issue: "useAuth must be used within AuthProvider"
**Solution**: Make sure component is inside AuthProvider in App.jsx

### Issue: "useVendorAuth must be used within VendorAuthProvider"
**Solution**: Make sure component is inside VendorAuthProvider in App.jsx

### Issue: Filters not clearing
**Solution**: Check if NavigationGuard is imported in App.jsx

### Issue: Can access protected route without login
**Solution**: Verify route is wrapped in ProtectedRoute or VendorProtectedRoute

---

## 📚 Full Documentation

For complete details, see: [PRODUCTION_VALIDATION_GUIDE.md](PRODUCTION_VALIDATION_GUIDE.md)

---

**Quick Start Commands**:
```bash
# Start development server
npm run dev

# Check for errors
npm run build

# Run linter
npm run lint
```
