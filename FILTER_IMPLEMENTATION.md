# Search Filter Implementation Guide

## Overview
Backend search filters ab properly implement ho gaye hain. Ye document explain karta hai ki filters kaise kaam karte hain aur kaise use karne hain.

## Backend Changes

### 1. Search Controller (`backend/controllers/searchController.js`)
- **Flexible parameter handling**: Ab controller dono formats accept karta hai:
  - Nested format: `{ location: { city: 'Mumbai' } }`
  - Flat format: `{ city: 'Mumbai' }`
- **Backward compatibility**: Purane API calls bhi kaam karenge
- **Better logging**: Debugging ke liye detailed console logs

### 2. Vendor Model (`backend/models/VendorNew.js`)
- **Improved budget filter**: 
  - Vendor ka price range user ke budget se overlap hona chahiye
  - Average price bhi consider hota hai
  - Null/undefined values properly handle hote hain
  
- **Enhanced location filter**:
  - City/area text search (case-insensitive, partial match)
  - Geospatial search (latitude/longitude with radius)
  - Geospatial search city/area filters ko override karta hai
  
- **Better verified filter**:
  - Boolean aur string dono formats accept karta hai
  - `true`, `'true'`, `false`, `'false'` sab kaam karte hain
  
- **Improved rating filter**:
  - Minimum rating se filter karta hai
  - Zero values ignore hote hain
  
- **Service-specific filters**:
  - Dynamic filters support (koi bhi custom filter add kar sakte hain)
  - Array, boolean, number, string sab types support hote hain

### 3. Frontend API Service (`frontend/src/services/api.js`)
- **Clean payload building**: Undefined values remove hote hain
- **Better validation**: Budget aur rating ke liye proper checks
- **Service-specific filters**: Additional filters automatically detect aur pass hote hain
- **Detailed logging**: Request/response tracking ke liye

## Filter Types

### 1. Text Search (`query`)
```javascript
{
  query: "wedding photographer"
}
```
- Business name, contact person, keywords me search karta hai
- Case-insensitive, partial match
- Multiple fields me simultaneously search hota hai

### 2. Service Type (`serviceId`)
```javascript
{
  serviceId: "photography"
}
```
- Specific service category se filter karta hai
- Case-insensitive
- Taxonomy system se linked hai

### 3. Location Filters

#### City/Area (Text-based)
```javascript
{
  location: {
    city: "Mumbai",
    area: "Andheri"
  }
}
```

#### Geospatial (Coordinate-based)
```javascript
{
  location: {
    latitude: 19.0760,
    longitude: 72.8777,
    radius: 10  // in kilometers
  }
}
```

### 4. Budget Filter
```javascript
{
  budget: {
    min: 50000,
    max: 100000
  }
}
```
- Vendor ka price range user ke budget se overlap hona chahiye
- Min ya max dono ya ek bhi specify kar sakte hain
- Zero values ignore hote hain

### 5. Verified Filter
```javascript
{
  verified: true
}
```
- Only verified vendors show karta hai
- Boolean value expected hai

### 6. Rating Filter
```javascript
{
  rating: 4.0
}
```
- Minimum rating se filter karta hai
- 0-5 range me value honi chahiye

### 7. Sorting
```javascript
{
  sort: "relevance"  // Options: relevance, rating, price-low, price-high, reviews, distance, popularity
}
```

### 8. Pagination
```javascript
{
  page: 1,
  limit: 20
}
```

## Complete Example

```javascript
// Frontend call
const filters = {
  query: "wedding",
  serviceType: "photography",
  city: "Mumbai",
  area: "Andheri",
  budgetMin: 50000,
  budgetMax: 100000,
  verified: true,
  rating: 4.5,
  sortBy: "rating",
  page: 1,
  limit: 20
};

const response = await fetchVendors(filters);
```

```javascript
// Backend receives (after transformation)
{
  query: "wedding",
  serviceId: "photography",
  location: {
    city: "Mumbai",
    area: "Andheri"
  },
  budget: {
    min: 50000,
    max: 100000
  },
  verified: true,
  rating: 4.5,
  sort: "rating",
  page: 1,
  limit: 20
}
```

## Testing

### Manual Testing
1. Start backend server: `cd backend && npm start`
2. Use Postman/Thunder Client to test API endpoint: `POST http://localhost:5000/api/search`
3. Try different filter combinations

### Automated Testing
```bash
cd backend
node test-search-filters.js
```

Ye script 10 different test cases run karega aur results show karega.

## Common Issues & Solutions

### Issue 1: Filters kaam nahi kar rahe
**Solution**: Browser console aur backend logs check karo. Payload format verify karo.

### Issue 2: Budget filter sahi results nahi de raha
**Solution**: 
- Check karo ki budgetMin aur budgetMax dono > 0 hain
- Vendor ke pricing.min, pricing.max, pricing.average values check karo

### Issue 3: Location filter kaam nahi kar raha
**Solution**:
- City/area names exactly match hone chahiye (case-insensitive hai)
- Geospatial search ke liye valid coordinates chahiye
- Radius kilometers me hona chahiye

### Issue 4: No results mil rahe hain
**Solution**:
- Filters ko ek-ek karke remove karo to identify which filter is too restrictive
- Database me vendors hain ya nahi check karo
- isActive: true vendors hi show hote hain

## Frontend Integration

### SearchResults.jsx
```javascript
const loadVendors = async () => {
  const searchFilters = {
    serviceType: filters.eventCategory || filters.eventSubType,
    city: filters.city || detailedLocation.city,
    budgetMin: filters.budgetMin > 0 ? filters.budgetMin : undefined,
    budgetMax: filters.budgetMax > 0 ? filters.budgetMax : undefined,
    verified: filters.verified,
    rating: filters.rating,
    sortBy: sortBy
  };
  
  const response = await fetchVendors(searchFilters);
  setVendors(response.vendors);
};
```

### FilterPanel.jsx
```javascript
const handleSearch = () => {
  onFilter({
    ...filters,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude
  });
};
```

## Performance Considerations

1. **Indexes**: MongoDB indexes properly set hain for:
   - serviceType + city + rating
   - location (2dsphere for geospatial)
   - pricing.average
   - verified, isActive

2. **Query Optimization**:
   - Text search uses regex (flexible but slower for large datasets)
   - Geospatial queries are optimized with 2dsphere index
   - Compound indexes for common filter combinations

3. **Pagination**: Always use pagination to limit results

## Future Enhancements

1. **Elasticsearch Integration**: For better text search performance
2. **Filter Caching**: Cache popular filter combinations
3. **Smart Suggestions**: Show suggested filters based on search context
4. **Filter Analytics**: Track which filters users use most
5. **Dynamic Filters**: Generate filters based on available data

## Support

Agar koi issue hai to:
1. Backend logs check karo (`console.log` statements)
2. Frontend console check karo
3. Network tab me API request/response dekho
4. Test script run karo to isolate the issue

---

**Last Updated**: February 2026
**Version**: 1.0
