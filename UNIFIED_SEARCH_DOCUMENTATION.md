# Unified Vendor Search System - Complete Documentation

## Overview

The Unified Vendor Search System is a production-grade, scalable algorithm that replaces all fragmented search logic with a single, predictable, and deterministic search engine.

## Architecture

### Design Principles

1. **Single Source of Truth**: One unified algorithm handles all search scenarios
2. **Strict Priority Ordering**: Results are always returned in a predictable order
3. **Zero-Result Prevention**: Progressive relaxation ensures meaningful results
4. **Geospatial Accuracy**: MongoDB 2dsphere indexes for precise distance calculations
5. **Dynamic Filtering**: Filters apply without breaking result order
6. **Scalability**: Designed for high concurrency and growing vendor base

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED SEARCH SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. INPUT VALIDATION & NORMALIZATION               │    │
│  │  - Coordinate validation                            │    │
│  │  - Budget range normalization                       │    │
│  │  - Pagination constraints                           │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. LOCATION RESOLUTION                            │    │
│  │  - Direct coordinates                               │    │
│  │  - Area ID lookup                                   │    │
│  │  - City + Area name resolution                      │    │
│  │  - City center fallback                             │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  3. TIERED SEARCH EXECUTION                        │    │
│  │                                                      │    │
│  │  TIER 1: Exact Area Match                          │    │
│  │  ├─ Vendors in exact searched area                 │    │
│  │  └─ Priority: 1 (Highest)                          │    │
│  │                                                      │    │
│  │  TIER 2: Nearby Vendors                            │    │
│  │  ├─ Geospatial query within radius                 │    │
│  │  ├─ Sorted by distance                             │    │
│  │  └─ Priority: 2                                    │    │
│  │                                                      │    │
│  │  TIER 3: Same City Vendors                         │    │
│  │  ├─ All vendors in same city                       │    │
│  │  ├─ Sorted by distance & rating                    │    │
│  │  └─ Priority: 3                                    │    │
│  │                                                      │    │
│  │  TIER 4: Adjacent City Vendors                     │    │
│  │  ├─ Vendors from nearby cities                     │    │
│  │  ├─ Within 100km threshold                         │    │
│  │  ├─ Only if results < 5                            │    │
│  │  └─ Priority: 4 (Lowest)                           │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  4. RESULT COMBINATION & DEDUPLICATION             │    │
│  │  - Merge all tiers in priority order               │    │
│  │  - Remove duplicates                                │    │
│  │  - Maintain strict ordering                         │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  5. PAGINATION & RESPONSE                          │    │
│  │  - Apply page/limit                                 │    │
│  │  - Calculate metadata                               │    │
│  │  - Return formatted response                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Search Priority Order

### Strict Hierarchy (ALWAYS MAINTAINED)

```
Priority 1: EXACT AREA MATCH
├─ Vendors whose area field exactly matches searched area
├─ Example: Searching "Vijay Nagar, Indore" returns Vijay Nagar vendors first
└─ Indicator: matchTier = 'exact_area', tierPriority = 1

Priority 2: NEARBY VENDORS (PROXIMITY)
├─ Vendors within specified radius of searched coordinates
├─ Sorted by actual distance (closest first)
├─ Example: Vendors 2-5km from Vijay Nagar
└─ Indicator: matchTier = 'nearby', tierPriority = 2

Priority 3: SAME CITY VENDORS
├─ Vendors anywhere in the same city
├─ Sorted by distance (if coordinates available) or rating
├─ Example: Other Indore vendors outside the area
└─ Indicator: matchTier = 'same_city', tierPriority = 3

Priority 4: ADJACENT CITY VENDORS
├─ Vendors from nearby cities within 100km
├─ Only included if total results < 5
├─ Example: Vendors from Ujjain (nearby city)
└─ Indicator: matchTier = 'adjacent_city', tierPriority = 4
```

## Dynamic Filtering

### Filter Application Rules

1. **Filters apply WITHOUT changing result order**
2. **Each tier is filtered independently** before combining
3. **Budget filtering has two modes**:
   - **Strict**: Exact budget match (Tier 1 & 2)
   - **Flexible**: ±20% flexibility (Tier 3 & 4)

### Supported Filters

#### Text Search
```javascript
query: "photography"
// Searches across: name, businessName, contactPerson, description, keywords, serviceType
```

#### Service Type
```javascript
serviceType: "photographer"
// Filters by vendor service category
```

#### Budget Range
```javascript
budget: { min: 20000, max: 50000 }
// Strict for nearby, flexible for distant vendors
```

#### Radius (Dynamic)
```javascript
radius: 10  // kilometers
// Real-time expansion/contraction
// Synchronized with lat/lon
```

#### Rating
```javascript
rating: 4.5
// Minimum rating threshold
```

#### Verified Status
```javascript
verified: true
// Only verified vendors
```

#### Custom Service Filters
```javascript
filters: {
  photography_type: ["candid", "traditional"],
  coverage_duration: "full_day",
  has_backup_equipment: true
}
```

## Zero-Result Prevention

### Progressive Relaxation Strategy

```
Step 1: Search with strict filters
  ↓
  IF results < 5
  ↓
Step 2: Relax budget constraints (±20%)
  ↓
  IF results < 5
  ↓
Step 3: Include adjacent cities (within 100km)
  ↓
  IF results < 5
  ↓
Step 4: Suggest alternative service types
  (using taxonomy normalization)
```

### Fallback Mechanisms

1. **Budget Flexibility**: Automatically adds ±20% to budget range for distant vendors
2. **Radius Expansion**: Not automatic, but radius can be increased dynamically
3. **Adjacent Cities**: Automatically included when results are insufficient
4. **Service Suggestions**: Normalized taxonomy provides alternative services

## Location Resolution Flow

### Priority Order

```
1. Direct Coordinates (highest priority)
   ├─ If latitude & longitude provided
   └─ Use directly for geospatial search

2. Area ID Lookup
   ├─ If areaId provided
   ├─ Lookup in Area collection
   └─ Extract coordinates from area document

3. City + Area Name
   ├─ Find city by name
   ├─ Find area within city
   └─ Extract coordinates

4. City Only
   ├─ Find city by name
   └─ Use city center coordinates

5. No Location
   └─ Location-independent search (service type, text, etc.)
```

## Geospatial Calculations

### Distance Formula: Haversine

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}
```

### MongoDB 2dsphere Index

```javascript
// Vendor schema
location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [Number] // [longitude, latitude]
}

// Index
vendorSchema.index({ location: '2dsphere' });

// Query
{
  location: {
    $nearSphere: {
      $geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      $maxDistance: radiusInMeters
    }
  }
}
```

## API Usage

### Request Format

```javascript
POST /api/search/vendors

{
  // Text search (optional)
  "query": "wedding photographer",
  
  // Service type filter (optional)
  "serviceId": "photographer",
  
  // Location (multiple formats supported)
  "location": {
    // Option 1: Area ID
    "areaId": "507f1f77bcf86cd799439011",
    
    // Option 2: City + Area name
    "city": "Indore",
    "area": "Vijay Nagar",
    
    // Option 3: Direct coordinates
    "latitude": 22.7532,
    "longitude": 75.8937,
    
    // Radius (optional, default 5km)
    "radius": 10
  },
  
  // Budget range (optional)
  "budget": {
    "min": 20000,
    "max": 50000
  },
  
  // Service-specific filters (optional)
  "filters": {
    "photography_type": ["candid"],
    "coverage_duration": "full_day"
  },
  
  // Trust filters (optional)
  "verified": true,
  "rating": 4.5,
  
  // Sorting (optional)
  "sort": "relevance", // relevance | rating | price-low | price-high | reviews | distance
  
  // Pagination
  "page": 1,
  "limit": 20
}
```

### Response Format

```javascript
{
  "success": true,
  "data": {
    "total": 47,
    "results": [
      {
        "vendorId": "VENDOR_123",
        "name": "Royal Photography",
        "serviceType": "photographer",
        "location": {
          "city": "Indore",
          "area": "Vijay Nagar",
          "coordinates": [75.8937, 22.7532]
        },
        "distance": 2.3,
        "rating": 4.8,
        "reviewCount": 156,
        "pricing": {
          "min": 25000,
          "max": 75000,
          "currency": "INR"
        },
        "verified": true,
        "matchTier": "exact_area",
        "tierPriority": 1
      }
      // ... more results
    ],
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    
    // Search quality metrics
    "searchQuality": {
      "tierBreakdown": {
        "exactArea": 15,
        "nearby": 22,
        "sameCity": 8,
        "adjacentCity": 2
      },
      "priorityOrder": [
        "Exact area match",
        "Nearby vendors",
        "Same city vendors",
        "Adjacent city vendors"
      ],
      "radiusUsed": 10,
      "totalMatches": 47
    },
    
    // What was searched
    "searchCriteria": {
      "query": "wedding photographer",
      "serviceType": "photographer",
      "location": {
        "coordinates": [75.8937, 22.7532],
        "area": "Vijay Nagar",
        "city": "Indore",
        "radiusKm": 10
      },
      "budget": { "min": 20000, "max": 50000 },
      "verified": true,
      "rating": 4.5
    },
    
    // Available filters from current results
    "availableFilters": {
      "budget": {
        "min": 15000,
        "max": 100000,
        "ranges": [...]
      },
      "rating": { "available": true },
      "verified": { "available": true },
      "services": [...],
      "location": {
        "cities": ["Indore", "Ujjain"],
        "areas": ["Vijay Nagar", "Palasia", ...]
      }
    },
    
    // Metadata
    "metadata": {
      "timestamp": "2026-02-16T10:30:00.000Z"
    }
  }
}
```

## Configuration

### Search Constants (Tunable)

```javascript
const SEARCH_CONFIG = {
  DEFAULT_RADIUS: 5,              // Default search radius (km)
  MAX_RADIUS: 50,                 // Maximum allowed radius (km)
  ADJACENT_CITY_RADIUS: 100,      // Threshold for adjacent cities (km)
  BUDGET_FLEXIBILITY_PERCENT: 20, // Budget flexibility (%)
  MIN_RESULTS_THRESHOLD: 5,       // Minimum before using adjacent cities
  
  MAX_RESULTS_PER_TIER: {
    exactArea: 50,
    nearby: 50,
    sameCity: 30,
    adjacentCity: 20
  },
  
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};
```

## Performance Considerations

### Database Indexes Required

```javascript
// Vendor collection
{ location: '2dsphere' }
{ city: 1, area: 1 }
{ serviceType: 1, isActive: 1, rating: -1 }
{ isActive: 1, verified: 1 }
{ 'pricing.average': 1 }
{ rating: -1, reviewCount: -1 }

// Area collection
{ city_id: 1, name: 1 }
{ location: '2dsphere' }

// City collection
{ name: 1 }
{ location: '2dsphere' }
```

### Query Optimization

1. **Tier Isolation**: Each tier queries independently, preventing complex joins
2. **Result Limits**: Each tier has maximum result limits to prevent over-fetching
3. **Compound Indexes**: Multi-field indexes for common filter combinations
4. **Lean Queries**: Use `.lean()` for read-only operations
5. **Projection**: Select only required fields

### Scalability Features

1. **Horizontal Scaling**: Each tier can be cached independently
2. **Connection Pooling**: MongoDB connection pool for high concurrency
3. **Query Caching**: Location resolution can be cached
4. **Background Jobs**: Popularity scoring can be pre-computed
5. **Read Replicas**: Geospatial queries can use read replicas

## Testing

### Test Scenarios

1. **Exact Location Match**
   - Search with exact area
   - Verify Tier 1 results appear first

2. **Radius-Based Search**
   - Search with coordinates and radius
   - Verify distance calculations
   - Verify results within radius

3. **Budget Filtering**
   - Search with budget range
   - Verify strict matching for nearby
   - Verify flexible matching for distant

4. **Zero Results**
   - Search with very restrictive filters
   - Verify progressive relaxation
   - Verify adjacent city inclusion

5. **Dynamic Radius**
   - Start with small radius
   - Increase radius dynamically
   - Verify result expansion

6. **Filter Combinations**
   - Apply multiple filters
   - Verify result order maintained
   - Verify filter accuracy

## Migration Guide

### From Old System to Unified Search

```javascript
// OLD WAY (fragmented)
const result = await Vendor.comprehensiveSearch(...);
const radiusExpanded = await expandRadius(...);
const filtered = await applyFilters(...);

// NEW WAY (unified)
const result = await searchVendors({
  query: "...",
  location: { city: "...", area: "...", radius: 10 },
  budget: { min: 20000, max: 50000 }
});
// Everything handled internally with strict priority
```

### Backward Compatibility

The controller maintains backward compatibility:
- Old request formats are accepted
- Response format is enhanced but compatible
- Existing filters continue to work

## Error Handling

### Validation Errors

```javascript
{
  "success": false,
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "Invalid coordinates provided",
    "details": {
      "latitude": 91.5,  // Out of range
      "longitude": 200   // Out of range
    }
  }
}
```

### Common Error Codes

- `INVALID_COORDINATES`: Lat/lon out of valid range
- `AREA_NOT_FOUND`: Specified area doesn't exist
- `CITY_NOT_FOUND`: Specified city doesn't exist
- `INVALID_BUDGET`: Budget min > max or negative values
- `INVALID_RADIUS`: Radius out of allowed range
- `INVALID_PAGINATION`: Invalid page or limit values

## Future Enhancements

### Roadmap

1. **ML-Based Ranking**: Incorporate user behavior for personalized results
2. **Caching Layer**: Redis cache for popular searches
3. **Elasticsearch Integration**: For advanced text search
4. **Real-time Availability**: Check vendor calendar availability
5. **Price Predictions**: ML-based price suggestions
6. **Demand-Based Ranking**: Show vendors with current high demand
7. **User Preferences**: Remember user's location and preferences

## Monitoring

### Key Metrics to Track

1. **Search Performance**
   - Average response time per tier
   - 95th percentile latency
   - Query execution time

2. **Result Quality**
   - Average results per tier
   - Zero-result scenarios count
   - Adjacent city trigger frequency

3. **User Behavior**
   - Most searched areas
   - Common budget ranges
   - Popular service types
   - Filter usage patterns

4. **System Health**
   - Database query performance
   - Connection pool status
   - Memory usage
   - CPU utilization

---

## Support and Contact

For questions or issues with the Unified Search System:
- Check this documentation first
- Review test scenarios
- Contact: backend-team@example.com
