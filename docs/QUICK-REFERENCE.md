# Quick Reference: Dynamic Event Marketplace

## 🚀 Quick Start

### Start the System
```bash
# Terminal 1: Backend
cd c:\Users\rudra\Desktop\Event\backend
npm start

# Terminal 2: Frontend
cd c:\Users\rudra\Desktop\Event\frontend
npm run dev

# Terminal 3: Verify
cd c:\Users\rudra\Desktop\Event\backend
node scripts/verify-production-transformation.js
```

---

## 🔗 API Endpoints

### Dynamic Data Endpoints
```
Base URL: http://localhost:5000/api/dynamic

GET /service-types
→ [{ value: 'photographer', label: 'Photographer', count: 45 }, ...]

GET /cities
→ [{ name: 'Mumbai', state: 'Maharashtra', count: 120 }, ...]

GET /price-ranges?serviceType=X&city=Y
→ [{ label: '₹25K-₹50K', min: 25000, max: 50000, count: 30 }, ...]

GET /search-suggestions?q=photo&limit=5
→ { vendors: [...], serviceTypes: [...], cities: [...] }

GET /filter-stats?city=X&serviceType=Y
→ { verifiedCount: 45, ratingBreakdown: {...}, totalCount: 120 }
```

### Test with curl
```bash
# Service types
curl http://localhost:5000/api/dynamic/service-types

# Cities
curl http://localhost:5000/api/dynamic/cities

# Search suggestions
curl "http://localhost:5000/api/dynamic/search-suggestions?q=photo"

# Price ranges for photographers in Mumbai
curl "http://localhost:5000/api/dynamic/price-ranges?serviceType=photographer&city=Mumbai"
```

---

## 🧪 Testing Scenarios

### 1. Test Dynamic Filters
```
✅ Open: http://localhost:5173/search
✅ Check: Service type dropdown loads from database
✅ Check: City dropdown shows vendor counts
✅ Check: Budget ranges are dynamic
✅ Expected: All filters populated in <500ms
```

### 2. Test Intelligent Search
```
✅ Search "photo" → finds "photographer" vendors
✅ Search "cater" → finds "caterer" vendors
✅ Search "plan" → finds "wedding_planner" vendors
✅ Expected: Partial matching works correctly
```

### 3. Test Vendor Registration Flow
```
✅ Register new vendor via API/admin panel
✅ Refresh search page
✅ New vendor appears in:
   - Service type dropdown (count updated)
   - Search results
   - Suggestions dropdown
✅ Expected: Instant visibility (no seed script needed)
```

### 4. Test Homepage
```
✅ Open: http://localhost:5173
✅ Check: Category menu loads dynamically
✅ Check: Popular searches appear
✅ Check: City dropdown works
✅ Expected: All data from database
```

---

## 🐛 Common Issues & Solutions

### Backend not responding
```bash
# Check if server is running
curl http://localhost:5000/api/dynamic/service-types

# If error:
# 1. Check MongoDB connection
# 2. Verify .env has MONGODB_URI
# 3. Restart backend: npm start
```

### Filters showing empty
```bash
# Check vendors exist in database
mongo <connection_string>
db.vendorsnew.countDocuments({ isActive: true })

# If 0 vendors:
# Run seed script: node scripts/seed-test-vendors.js
```

### Search not finding vendors
```bash
# Check serviceType format
db.vendorsnew.distinct('serviceType')

# Should be lowercase: ['photographer', 'caterer', ...]
# If mixed case, run migration to normalize
```

### Slow performance
```bash
# Check database indexes
db.vendorsnew.getIndexes()

# Create if missing:
db.vendorsnew.createIndex({ serviceType: 1 })
db.vendorsnew.createIndex({ city: 1 })
db.vendorsnew.createIndex({ isActive: 1 })
```

---

## 📁 File Locations

### Backend
```
backend/routes/dynamicRoutes.js          → 5 dynamic API endpoints
backend/server.js                         → Route registration
backend/models/VendorNew.js               → Search with regex matching
backend/scripts/verify-production-transformation.js → Test script
```

### Frontend
```
frontend/src/services/dynamicDataService.js    → API client
frontend/src/pages/SearchEventsPage.jsx        → Main search page
frontend/src/components/EventSearch.jsx        → Homepage search
frontend/src/pages/SearchResultsFunnel.jsx     → Funnel page
```

### Documentation
```
docs/PRODUCTION-TRANSFORMATION-COMPLETE.md     → Full technical docs
docs/PRODUCTION-TRANSFORMATION-SUMMARY.md      → Implementation summary
docs/QUICK-REFERENCE.md                        → This file
```

---

## 💡 Key Concepts

### Dynamic Data Flow
```
1. Frontend component mounts
   ↓
2. Calls dynamicDataService.fetchServiceTypes()
   ↓
3. API request to /api/dynamic/service-types
   ↓
4. Backend queries MongoDB for distinct serviceTypes
   ↓
5. Returns [{ value, label, count }, ...]
   ↓
6. Frontend updates state and renders
```

### Intelligent Search
```
User types: "photo"
   ↓
Backend normalizes: "photograph"
   ↓
MongoDB regex: /photograph/i
   ↓
Matches: "photographer", "photography", "photo"
   ↓
Returns all matching vendors
```

### Vendor Registration → Search Visibility
```
1. Register vendor with serviceType: "photographer"
   ↓
2. Saved to MongoDB vendorsnew collection
   ↓
3. Next API call to /dynamic/service-types
   ↓
4. Automatically includes new vendor in count
   ↓
5. Appears in search immediately (no manual refresh)
```

---

## 🎯 Success Checklist

- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] All 5 dynamic endpoints return data
- [ ] Frontend loads and shows filters
- [ ] Search "photo" finds photographers
- [ ] City dropdown shows vendor counts
- [ ] New vendor registration works instantly
- [ ] No static arrays in any component
- [ ] Performance: filters load <500ms
- [ ] No errors in browser console

---

## 🔧 Useful Commands

### Database Queries
```javascript
// Count active vendors
db.vendorsnew.countDocuments({ isActive: true })

// List service types
db.vendorsnew.distinct('serviceType')

// Count by service type
db.vendorsnew.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$serviceType', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// List cities
db.vendorsnew.distinct('city')

// Find photographers in Mumbai
db.vendorsnew.find({ 
  serviceType: /photog/i, 
  city: 'Mumbai',
  isActive: true 
})
```

### API Testing
```bash
# Pretty print JSON response
curl http://localhost:5000/api/dynamic/service-types | jq

# Check response time
time curl http://localhost:5000/api/dynamic/service-types

# Test with filters
curl "http://localhost:5000/api/dynamic/filter-stats?city=Mumbai&serviceType=photographer" | jq
```

### Frontend Debugging
```javascript
// Check API calls in browser console
// Network tab → Filter: "dynamic"
// Should see:
// - service-types (200 OK)
// - cities (200 OK)
// - search-suggestions (200 OK)

// Check React state
// React DevTools → Components
// SearchEventsPage → State → serviceTypes, cities
```

---

## 📊 Performance Benchmarks

### Expected Response Times
- `/service-types`: <100ms
- `/cities`: <100ms
- `/price-ranges`: <150ms
- `/search-suggestions`: <200ms
- `/filter-stats`: <100ms

### Frontend Load Times
- Homepage: <1s
- Search page filters: <500ms
- Search suggestions: <300ms (with debounce)

### Database Query Times
- Distinct serviceTypes: <50ms
- Distinct cities: <50ms
- Aggregate price ranges: <100ms
- Vendor search: <100ms

*All with proper indexes: `serviceType`, `city`, `isActive`*

---

## 🚀 Deployment Checklist

- [ ] MongoDB connection string in .env
- [ ] Database indexes created
- [ ] Backend environment variables set
- [ ] Frontend API URL configured
- [ ] CORS configured for frontend domain
- [ ] Error logging enabled
- [ ] Performance monitoring setup
- [ ] Backup strategy in place

---

**Quick Ref Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready
