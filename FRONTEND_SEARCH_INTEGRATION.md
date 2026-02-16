# Frontend Integration Guide - Unified Search API

## Quick Start

The vendor search API has been upgraded with a unified algorithm that ensures **strict priority ordering** and **comprehensive metadata**.

### Endpoint

```
POST /api/search/vendors
```

### Migration Impact

- ✅ **Backward Compatible**: Existing request formats continue to work
- ✅ **Enhanced Response**: Additional metadata fields for better UX
- ⚠️ **New Fields**: `matchTier`, `tierPriority`, `searchQuality` available
- ⚠️ **Result Ordering**: Now guaranteed to follow priority hierarchy

---

## Request Format

### Basic Search

```javascript
// Example 1: Search by city and area
const response = await api.post('/api/search/vendors', {
  location: {
    city: 'Delhi',
    area: 'Connaught Place',
    radius: 10  // km (optional, default: 5)
  },
  page: 1,
  limit: 20
});
```

```javascript
// Example 2: Search by coordinates
const response = await api.post('/api/search/vendors', {
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    radius: 15
  },
  page: 1,
  limit: 20
});
```

```javascript
// Example 3: Search by area ID
const response = await api.post('/api/search/vendors', {
  location: {
    areaId: '507f1f77bcf86cd799439011',
    radius: 10
  },
  page: 1,
  limit: 20
});
```

### Advanced Filtering

```javascript
const response = await api.post('/api/search/vendors', {
  // Text search
  query: 'wedding photographer',
  
  // Service type
  serviceId: 'photographer',
  
  // Location
  location: {
    city: 'Indore',
    area: 'Vijay Nagar',
    radius: 10
  },
  
  // Budget range
  budget: {
    min: 20000,
    max: 50000
  },
  
  // Trust filters
  verified: true,
  rating: 4.5,
  
  // Service-specific filters
  filters: {
    photography_type: ['candid', 'traditional'],
    coverage_duration: 'full_day',
    has_backup_equipment: true
  },
  
  // Pagination
  page: 1,
  limit: 20
});
```

---

## Response Format

### Success Response

```javascript
{
  "success": true,
  "data": {
    // Pagination
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    
    // Results array
    "results": [
      {
        // Vendor details
        "_id": "64a1b2c3d4e5f678901234ab",
        "vendorId": "VENDOR_123",
        "name": "Royal Photography",
        "businessName": "Royal Wedding Photography Studio",
        "serviceType": "photographer",
        
        // Location
        "location": {
          "city": "Delhi",
          "area": "Connaught Place",
          "coordinates": [77.2167, 28.6278]
        },
        
        // Distance (in km, only for geospatial searches)
        "distance": 2.3,
        
        // Rating & reviews
        "rating": 4.8,
        "reviewCount": 156,
        
        // Pricing
        "pricing": {
          "min": 25000,
          "max": 75000,
          "average": 50000,
          "currency": "INR"
        },
        
        // Trust indicators
        "verified": true,
        "responseTime": "within 2 hours",
        
        // NEW: Match quality indicators
        "matchTier": "exact_area",     // exact_area | nearby | same_city | adjacent_city
        "tierPriority": 1,              // 1 = highest priority
        
        // Other fields...
        "description": "...",
        "media": [...],
        "keywords": [...],
        "availability": {...}
      }
      // ... more results
    ],
    
    // NEW: Search quality metrics
    "searchQuality": {
      "tierBreakdown": {
        "exactArea": 15,      // Number of exact area matches
        "nearby": 22,         // Number of nearby vendors
        "sameCity": 8,        // Number of same city vendors
        "adjacentCity": 2     // Number of adjacent city vendors
      },
      "priorityOrder": [
        "Exact area match",
        "Nearby vendors",
        "Same city vendors",
        "Adjacent city vendors"
      ],
      "radiusUsed": 10,       // Actual radius used (km)
      "totalMatches": 47
    },
    
    // Search criteria used
    "searchCriteria": {
      "query": "wedding photographer",
      "serviceType": "photographer",
      "location": {
        "coordinates": [77.2167, 28.6278],
        "area": "Connaught Place",
        "city": "Delhi",
        "radiusKm": 10
      },
      "budget": { "min": 20000, "max": 50000 },
      "verified": true,
      "rating": 4.5
    },
    
    // Available filter options from current result set
    "availableFilters": {
      "budget": {
        "min": 15000,
        "max": 100000,
        "ranges": [
          { "label": "Under ₹25k", "min": 0, "max": 25000, "count": 12 },
          { "label": "₹25k - ₹50k", "min": 25000, "max": 50000, "count": 18 },
          { "label": "₹50k - ₹1L", "min": 50000, "max": 100000, "count": 15 },
          { "label": "Above ₹1L", "min": 100000, "max": null, "count": 2 }
        ]
      },
      "rating": {
        "available": true,
        "distribution": {
          "5": 8,
          "4": 25,
          "3": 12,
          "2": 2
        }
      },
      "verified": {
        "available": true,
        "verifiedCount": 32,
        "unverifiedCount": 15
      },
      "services": [
        { "id": "photographer", "label": "Photography", "count": 47 },
        { "id": "videographer", "label": "Videography", "count": 23 }
      ],
      "location": {
        "cities": ["Delhi", "Gurgaon", "Noida"],
        "areas": ["Connaught Place", "Saket", "Lajpat Nagar", ...]
      }
    },
    
    // Metadata
    "metadata": {
      "searchLocation": {
        "coordinates": [77.2167, 28.6278],
        "area": "Connaught Place",
        "city": "Delhi",
        "source": "city+area"  // direct | areaId | city+area | city
      },
      "timestamp": "2026-02-16T12:30:45.123Z"
    }
  }
}
```

### Error Response

```javascript
{
  "success": false,
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "Invalid coordinates provided",
    "details": {
      "latitude": 91.5,  // Out of range (-90 to 90)
      "longitude": 200   // Out of range (-180 to 180)
    }
  }
}
```

---

## Understanding Match Tiers

Each vendor result now includes `matchTier` and `tierPriority` to indicate match quality:

### Tier 1: Exact Area Match (Highest Priority)
```javascript
{
  "matchTier": "exact_area",
  "tierPriority": 1,
  // Vendor's area exactly matches searched area
}
```
**UI Suggestion:** Display badge "In Your Area" or highlight these results

### Tier 2: Nearby Vendors
```javascript
{
  "matchTier": "nearby",
  "tierPriority": 2,
  "distance": 4.2  // km from search location
}
```
**UI Suggestion:** Show distance: "4.2 km away"

### Tier 3: Same City Vendors
```javascript
{
  "matchTier": "same_city",
  "tierPriority": 3,
  "distance": 12.5  // If coordinates available
}
```
**UI Suggestion:** Show "Same city" or distance if available

### Tier 4: Adjacent City Vendors
```javascript
{
  "matchTier": "adjacent_city",
  "tierPriority": 4,
  "distance": 35.8
}
```
**UI Suggestion:** Show "Nearby city" badge and distance

---

## Frontend Implementation Examples

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { searchVendors } from './api/search';

function VendorSearchResults({ searchParams }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuality, setSearchQuality] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await searchVendors(searchParams);
        
        if (response.data.success) {
          setResults(response.data.data.results);
          setSearchQuality(response.data.data.searchQuality);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  return (
    <div>
      {/* Search quality indicator */}
      {searchQuality && (
        <div className="search-quality-banner">
          <p>Found {searchQuality.totalMatches} vendors</p>
          {searchQuality.tierBreakdown.exactArea > 0 && (
            <span className="badge-success">
              {searchQuality.tierBreakdown.exactArea} in your area
            </span>
          )}
          {searchQuality.tierBreakdown.nearby > 0 && (
            <span className="badge-info">
              {searchQuality.tierBreakdown.nearby} nearby
            </span>
          )}
        </div>
      )}

      {/* Results list */}
      <div className="vendor-list">
        {results.map((vendor) => (
          <VendorCard 
            key={vendor._id} 
            vendor={vendor}
            matchTier={vendor.matchTier}
            distance={vendor.distance}
          />
        ))}
      </div>
    </div>
  );
}

function VendorCard({ vendor, matchTier, distance }) {
  // Tier-based badge
  const getBadge = () => {
    switch (matchTier) {
      case 'exact_area':
        return <span className="badge badge-success">In Your Area</span>;
      case 'nearby':
        return <span className="badge badge-info">{distance.toFixed(1)} km away</span>;
      case 'same_city':
        return <span className="badge badge-secondary">Same City</span>;
      case 'adjacent_city':
        return <span className="badge badge-warning">Nearby City</span>;
      default:
        return null;
    }
  };

  return (
    <div className="vendor-card">
      <div className="vendor-header">
        <h3>{vendor.name}</h3>
        {getBadge()}
      </div>
      
      <div className="vendor-details">
        <p>{vendor.location.area}, {vendor.location.city}</p>
        <div className="rating">
          <span>⭐ {vendor.rating}</span>
          <span>({vendor.reviewCount} reviews)</span>
        </div>
        <div className="pricing">
          ₹{vendor.pricing.min.toLocaleString()} - ₹{vendor.pricing.max.toLocaleString()}
        </div>
        {vendor.verified && (
          <span className="verified-badge">✓ Verified</span>
        )}
      </div>
    </div>
  );
}
```

### Filter Panel Implementation

```jsx
function FilterPanel({ searchParams, onFilterChange, availableFilters }) {
  const handleBudgetChange = (min, max) => {
    onFilterChange({
      ...searchParams,
      budget: { min, max }
    });
  };

  const handleRadiusChange = (radius) => {
    onFilterChange({
      ...searchParams,
      location: {
        ...searchParams.location,
        radius
      }
    });
  };

  return (
    <div className="filter-panel">
      {/* Budget filter with available ranges */}
      <div className="filter-section">
        <h4>Budget</h4>
        {availableFilters.budget.ranges.map((range) => (
          <button
            key={range.label}
            onClick={() => handleBudgetChange(range.min, range.max)}
            className="filter-option"
          >
            {range.label} ({range.count})
          </button>
        ))}
      </div>

      {/* Radius filter */}
      <div className="filter-section">
        <h4>Search Radius</h4>
        <input
          type="range"
          min="1"
          max="50"
          value={searchParams.location.radius || 5}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
        />
        <span>{searchParams.location.radius || 5} km</span>
      </div>

      {/* Verified only */}
      <div className="filter-section">
        <label>
          <input
            type="checkbox"
            checked={searchParams.verified || false}
            onChange={(e) => onFilterChange({
              ...searchParams,
              verified: e.target.checked
            })}
          />
          Verified Only ({availableFilters.verified.verifiedCount})
        </label>
      </div>

      {/* Rating filter */}
      <div className="filter-section">
        <h4>Minimum Rating</h4>
        {[5, 4, 3].map((rating) => (
          <button
            key={rating}
            onClick={() => onFilterChange({
              ...searchParams,
              rating
            })}
            className="filter-option"
          >
            {rating}⭐ & above ({availableFilters.rating.distribution[rating] || 0})
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Pagination Component

```jsx
function Pagination({ page, totalPages, hasNextPage, hasPrevPage, onPageChange }) {
  return (
    <div className="pagination">
      <button
        disabled={!hasPrevPage}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>
      
      <span>Page {page} of {totalPages}</span>
      
      <button
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
```

---

## Best Practices

### 1. Display Search Quality

Always show tier breakdown to users:
```jsx
{searchQuality.tierBreakdown.exactArea > 0 && (
  <div className="quality-banner success">
    ✓ {searchQuality.tierBreakdown.exactArea} vendors found in your exact area
  </div>
)}

{searchQuality.totalMatches === 0 && (
  <div className="quality-banner warning">
    ⚠ No vendors found. Try increasing search radius or removing filters.
  </div>
)}
```

### 2. Visualize Distance

For geospatial searches, show distance prominently:
```jsx
{vendor.distance && (
  <div className="distance-indicator">
    <span className="icon">📍</span>
    <span>{vendor.distance.toFixed(1)} km away</span>
  </div>
)}
```

### 3. Highlight Priority Results

Use visual hierarchy to emphasize Tier 1 results:
```jsx
<div className={`vendor-card tier-${vendor.tierPriority}`}>
  {vendor.matchTier === 'exact_area' && (
    <div className="featured-badge">⭐ Top Match</div>
  )}
  {/* ... vendor details */}
</div>
```

### 4. Dynamic Radius Adjustment

Suggest radius expansion when few results:
```jsx
{searchQuality.totalMatches < 5 && (
  <button onClick={() => expandRadius()}>
    🔍 Expand search radius to find more vendors
  </button>
)}
```

### 5. Filter Suggestions

Use `availableFilters` to show only relevant options:
```jsx
{availableFilters.services.map((service) => (
  <FilterButton 
    key={service.id}
    label={`${service.label} (${service.count})`}
    available={service.count > 0}
  />
))}
```

---

## Error Handling

```javascript
try {
  const response = await searchVendors(params);
  
  if (!response.data.success) {
    // Handle API errors
    switch (response.data.error.code) {
      case 'INVALID_COORDINATES':
        showError('Invalid location coordinates. Please try again.');
        break;
      case 'AREA_NOT_FOUND':
        showError('Area not found. Please select a different location.');
        break;
      case 'CITY_NOT_FOUND':
        showError('City not found in our database.');
        break;
      default:
        showError('Search failed. Please try again.');
    }
  }
} catch (error) {
  console.error('Network error:', error);
  showError('Unable to connect to server. Please check your internet connection.');
}
```

---

## Performance Tips

### 1. Debounce Search
```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((params) => {
  searchVendors(params);
}, 300);
```

### 2. Cache Results
```javascript
const [cache, setCache] = useState({});

const getCacheKey = (params) => JSON.stringify(params);

const search = async (params) => {
  const cacheKey = getCacheKey(params);
  
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  
  const results = await searchVendors(params);
  setCache({ ...cache, [cacheKey]: results });
  return results;
};
```

### 3. Progressive Loading
```javascript
const [vendors, setVendors] = useState([]);
const [page, setPage] = useState(1);

const loadMore = async () => {
  const response = await searchVendors({
    ...searchParams,
    page: page + 1
  });
  
  setVendors([...vendors, ...response.data.data.results]);
  setPage(page + 1);
};
```

---

## Testing Your Integration

### 1. Test with Different Locations
- Test with exact area matches
- Test with coordinates
- Test with city-only searches

### 2. Test Filter Combinations
- Budget + verified
- Rating + service type
- Radius + budget

### 3. Test Edge Cases
- Zero results
- Single result
- Very large result set

### 4. Test Tier Visualization
- Ensure Tier 1 results are highlighted
- Distance is shown for Tier 2
- Tier transitions are clear in UI

---

## Migration Checklist

- [ ] Update API endpoint if changed
- [ ] Add `matchTier` and `tierPriority` to result rendering
- [ ] Display distance for geospatial searches
- [ ] Show search quality metrics to users
- [ ] Implement tier-based visual hierarchy
- [ ] Add radius expansion suggestions
- [ ] Update filter panel with `availableFilters`
- [ ] Handle new error codes
- [ ] Test with real search scenarios
- [ ] Update loading states and empty states

---

## Support

For questions or issues:
- Backend API: `/UNIFIED_SEARCH_DOCUMENTATION.md`
- Test the search: `node backend/scripts/test-unified-search.js`
- Report issues: Contact backend team

