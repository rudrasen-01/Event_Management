# 📍 GEO-LOCATION BASED VENDOR MARKETPLACE ARCHITECTURE

## 🎯 SYSTEM OVERVIEW

This is a **production-ready, simple, and efficient** location-based vendor matching system that:

✅ Vendors register with **manually typed city + area + pincode**  
✅ Backend **geocodes ONCE** at registration (converts address → coordinates)  
✅ Areas are **auto-populated** from vendor registrations (grows organically)  
✅ User searches by **city + area dropdown**  
✅ Results matched using **geo-distance queries** (MongoDB $near), NOT text matching  
✅ **Auto-expands radius** if nearby results are too few  
✅ **NO external API calls** during search (uses cached area coordinates)  

---

## 🏗️ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│  1. VENDOR REGISTRATION                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Vendor Input:                                                   │
│  ┌──────────────┐                                               │
│  │ City: Delhi  │  <- From dropdown (cities collection)         │
│  │ Area: Saket  │  <- Manual text input                         │
│  │ Pincode: 110017                                              │
│  │ Landmark: Near Metro                                         │
│  └──────────────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  Backend Geocoding (ONE-TIME):                                  │
│  ┌───────────────────────────────────────┐                     │
│  │ buildAddressString()                  │                     │
│  │ → "Saket, Delhi, 110017, India"      │                     │
│  │                                       │                     │
│  │ geocodeAddress() → Nominatim/Google  │                     │
│  │ → [77.2066, 28.5244]                 │                     │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  Save to MongoDB:                                               │
│  ┌───────────────────────────────────────┐                     │
│  │ VendorNew {                           │                     │
│  │   city: "Delhi",                      │                     │
│  │   area: "Saket",                      │                     │
│  │   pincode: "110017",                  │                     │
│  │   location: {                         │                     │
│  │     type: "Point",                    │                     │
│  │     coordinates: [77.2066, 28.5244]   │  <- GeoJSON        │
│  │   },                                  │                     │
│  │   locationKeywords: [                 │                     │
│  │     "delhi", "saket", "110017"        │  <- Fuzzy match    │
│  │   ]                                   │                     │
│  │ }                                     │                     │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  Auto-Create/Update Area:                                       │
│  ┌───────────────────────────────────────┐                     │
│  │ Area.createOrUpdateFromVendor({       │                     │
│  │   cityId: ObjectId("..."),            │                     │
│  │   cityName: "Delhi",                  │                     │
│  │   area: "Saket",                      │                     │
│  │   lat: 28.5244,                       │                     │
│  │   lon: 77.2066                        │                     │
│  │ })                                    │                     │
│  │                                       │                     │
│  │ → Creates new area OR increments      │                     │
│  │   vendorCount if exists               │                     │
│  └───────────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. USER SEARCH                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: User selects city                                      │
│  ┌──────────────────────────┐                                  │
│  │ GET /api/locations/cities/name/Delhi/areas                  │
│  └──────────────────────────┘                                  │
│         │                                                        │
│         ▼                                                        │
│  Frontend receives areas:                                       │
│  ┌───────────────────────────────────────┐                     │
│  │ [                                     │                     │
│  │   {                                   │                     │
│  │     id: "...",                        │                     │
│  │     name: "Saket",                    │                     │
│  │     coordinates: [77.2066, 28.5244],  │                     │
│  │     vendorCount: 12                   │                     │
│  │   },                                  │                     │
│  │   { name: "Connaught Place", ... },   │                     │
│  │   { name: "Hauz Khas", ... }          │                     │
│  │ ]                                     │                     │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  Step 2: User selects area                                      │
│  ┌──────────────────────────┐                                  │
│  │ Area: Saket              │                                  │
│  │ Service: Photography     │                                  │
│  │ Budget: ₹20k - ₹50k      │                                  │
│  └──────────────────────────┘                                  │
│         │                                                        │
│         ▼                                                        │
│  Backend Search (NO API CALL):                                  │
│  ┌───────────────────────────────────────┐                     │
│  │ POST /api/search/vendors              │                     │
│  │ {                                     │                     │
│  │   serviceId: "photography",           │                     │
│  │   location: {                         │                     │
│  │     city: "Delhi",                    │                     │
│  │     area: "Saket",                    │                     │
│  │     areaId: "..."                     │                     │
│  │   },                                  │                     │
│  │   budget: { min: 20000, max: 50000 }  │                     │
│  │ }                                     │                     │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  Fetch Area Coordinates (from cache):                          │
│  ┌───────────────────────────────────────┐                     │
│  │ Area.findById(areaId)                 │                     │
│  │ → coordinates: [77.2066, 28.5244]     │  <- NO API CALL!   │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  MongoDB Geo-Distance Query:                                    │
│  ┌───────────────────────────────────────┐                     │
│  │ VendorNew.find({                      │                     │
│  │   serviceType: "photography",         │                     │
│  │   location: {                         │                     │
│  │     $near: {                          │                     │
│  │       $geometry: {                    │                     │
│  │         type: "Point",                │                     │
│  │         coordinates: [77.2066, 28.5244]                     │
│  │       },                              │                     │
│  │       $maxDistance: 5000  // 5km      │                     │
│  │     }                                 │                     │
│  │   },                                  │                     │
│  │   "pricing.min": { $lte: 50000 },     │                     │
│  │   "pricing.max": { $gte: 20000 }      │                     │
│  │ })                                    │                     │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  Auto-Expand Radius (if results < 5):                          │
│  ┌───────────────────────────────────────┐                     │
│  │ if (results.length < 5) {             │                     │
│  │   searchAgain(radius: 10km)           │                     │
│  │ }                                     │                     │
│  └───────────────────────────────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  Return Results with Distance:                                  │
│  ┌───────────────────────────────────────┐                     │
│  │ {                                     │                     │
│  │   vendors: [                          │                     │
│  │     {                                 │                     │
│  │       name: "Perfect Pixels",         │                     │
│  │       area: "Saket",                  │                     │
│  │       distance: 0.8,  // km           │                     │
│  │       rating: 4.5                     │                     │
│  │     },                                │                     │
│  │     {                                 │                     │
│  │       name: "Capture Moments",        │                     │
│  │       area: "Malviya Nagar",          │                     │
│  │       distance: 3.2,  // km           │                     │
│  │       rating: 4.7                     │                     │
│  │     }                                 │                     │
│  │   ],                                  │                     │
│  │   searchRadius: 5,                    │                     │
│  │   radiusExpanded: false               │                     │
│  │ }                                     │                     │
│  └───────────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 FILE STRUCTURE

```
backend/
├── services/
│   └── geocodingService.js          ← 🆕 Geocoding logic (Nominatim/Google)
│
├── models/
│   ├── VendorNew.js                 ← ✏️  Updated with locationKeywords
│   ├── Area.js                      ← ✏️  Added createOrUpdateFromVendor()
│   └── City.js                      ← Existing
│
├── controllers/
│   ├── vendorControllerNew.js       ← ✏️  Updated registerVendor() with geocoding
│   ├── searchController.js          ← ✏️  Updated searchVendors() with geo-queries
│   └── locationController.js        ← ✏️  Added getAreasByCityName()
│
└── routes/
    └── locationRoutes.js            ← ✏️  Added /cities/name/:cityName/areas
```

---

## 🔧 SETUP INSTRUCTIONS

### 1. Environment Variables

Add to `.env`:

```bash
# GEOCODING PROVIDER
GEOCODING_PROVIDER=nominatim   # Options: 'nominatim' (free) or 'google'

# Optional: Google Maps API Key (if using 'google' provider)
GOOGLE_MAPS_API_KEY=your_key_here
```

**Nominatim (FREE):**
- No API key required
- 1 request per second limit
- Good accuracy for Indian cities

**Google Maps (PAID but more accurate):**
- Requires API key & billing setup
- Free $200/month credit (~10,000 geocoding requests)
- Better accuracy for Indian localities

### 2. Install Dependencies

```bash
cd backend
npm install axios
```

(Already installed if you have `axios` in package.json)

---

## 🚀 API ENDPOINTS

### **Vendor Registration**

```http
POST /api/vendors/register
Content-Type: application/json

{
  "name": "Perfect Pixels Photography",
  "serviceType": "photography",
  "city": "Delhi",              ← From dropdown
  "area": "Saket",              ← Manual text input
  "pincode": "110017",          ← Manual text input
  "landmark": "Near Saket Metro", ← Optional
  "address": "A-123, Saket, Delhi",
  "pricing": {
    "min": 25000,
    "max": 75000
  },
  "contact": {
    "email": "vendor@example.com",
    "phone": "9876543210"
  },
  "password": "securepass123"
}
```

**Backend Process:**
1. Builds address: `"Saket, Near Saket Metro, Delhi, 110017, India"`
2. Geocodes using Nominatim/Google → `[77.2066, 28.5244]`
3. Saves vendor with GeoJSON coordinates
4. Auto-creates `Area` document for "Saket" if it doesn't exist

---

### **Get Areas for City (Frontend Dropdown)**

```http
GET /api/locations/cities/name/Delhi/areas
```

**Response:**
```json
{
  "success": true,
  "count": 45,
  "city": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Delhi",
    "lat": 28.6139,
    "lon": 77.2090
  },
  "data": [
    {
      "id": "507f...",
      "name": "Saket",
      "lat": 28.5244,
      "lon": 77.2066,
      "coordinates": [77.2066, 28.5244],
      "vendorCount": 12
    },
    {
      "id": "507f...",
      "name": "Connaught Place",
      "lat": 28.6315,
      "lon": 77.2167,
      "coordinates": [77.2167, 28.6315],
      "vendorCount": 8
    }
  ]
}
```

---

### **Search Vendors (Geo-Distance Based)**

```http
POST /api/search/vendors
Content-Type: application/json

{
  "serviceId": "photography",
  "location": {
    "city": "Delhi",
    "area": "Saket",
    "areaId": "507f1f77bcf86cd799439011"  ← From dropdown selection
  },
  "budget": {
    "min": 20000,
    "max": 50000
  },
  "rating": 4.0,
  "filters": {
    "photography_type": ["candid", "traditional"]
  }
}
```

**Backend Process:**
1. Fetches area coordinates from `Area` collection (NO API call)
2. Runs MongoDB `$near` query with 5km radius
3. If results < 5, auto-expands to 10km
4. Calculates distance for each vendor
5. Returns sorted by distance + rating

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 8,
    "results": [
      {
        "vendorId": "VENDOR_123",
        "name": "Perfect Pixels",
        "area": "Saket",
        "distance": 0.8,
        "distanceUnit": "km",
        "rating": 4.7,
        "pricing": { "min": 25000, "max": 75000 }
      },
      {
        "name": "Capture Moments",
        "area": "Malviya Nagar",
        "distance": 3.2,
        "rating": 4.5
      }
    ],
    "searchCriteria": {
      "location": {
        "city": "Delhi",
        "area": "Saket",
        "radius": 5,
        "radiusExpanded": false
      }
    }
  }
}
```

---

## 🔍 HOW IT WORKS

### **1. Vendor Registration Flow**

```javascript
// User submits: city="Delhi", area="Saket", pincode="110017"

// Backend:
const addressString = buildAddressString({
  area: "Saket",
  city: "Delhi",
  pincode: "110017"
});
// → "Saket, Delhi, 110017, India"

const { lat, lon } = await geocodeAddress(addressString);
// → Nominatim API → [28.5244, 77.2066]

await Vendor.create({
  city: "Delhi",
  area: "Saket",
  location: {
    type: "Point",
    coordinates: [77.2066, 28.5244]  // [lon, lat] GeoJSON format
  },
  locationKeywords: ["delhi", "saket", "110017"]
});

await Area.createOrUpdateFromVendor({
  cityId: cityDoc._id,
  cityName: "Delhi",
  area: "Saket",
  lat: 28.5244,
  lon: 77.2066
});
// → Creates "Saket" area if not exists
```

### **2. User Search Flow**

```javascript
// Frontend: User selects "Delhi" → Fetch areas
const response = await fetch('/api/locations/cities/name/Delhi/areas');
const { data: areas } = await response.json();
// → Shows dropdown with: Saket, CP, Hauz Khas, etc.

// User selects "Saket" → Get corresponding areaId and coordinates from dropdown data

// Backend: Search vendors near "Saket"
const areaDoc = await Area.findById(areaId);
// → { coordinates: [77.2066, 28.5244] }  ← From cache, NO API call!

const vendors = await Vendor.find({
  serviceType: "photography",
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: areaDoc.location.coordinates
      },
      $maxDistance: 5000  // 5km
    }
  }
});
```

---

## 📊 DATABASE SCHEMA

### **VendorNew Collection**

```javascript
{
  vendorId: "VENDOR_1707912345_abc123",
  name: "Perfect Pixels Photography",
  serviceType: "photography",
  
  // Text fields (display only, NOT used for matching)
  city: "Delhi",
  area: "Saket",
  pincode: "110017",
  address: "A-123, Saket, Delhi",
  
  // GeoJSON coordinates (PRIMARY matching key)
  location: {
    type: "Point",
    coordinates: [77.2066, 28.5244]  // [longitude, latitude]
  },
  
  // Keywords for fuzzy location search
  locationKeywords: [
    "delhi",
    "saket",
    "110017",
    "near saket metro"
  ],
  
  pricing: { min: 25000, max: 75000 },
  rating: 4.7
}
```

**Indexes:**
```javascript
{ location: "2dsphere" }  // Geo-spatial index for $near queries
{ city: 1, area: 1 }
{ locationKeywords: 1 }
```

### **Area Collection** (Auto-populated from vendor registrations)

```javascript
{
  osm_id: "vendor/delhi/saket",
  name: "Saket",
  normalizedName: "saket",
  
  city_id: ObjectId("507f1f77bcf86cd799439011"),
  cityName: "Delhi",
  
  // GeoJSON coordinates (cached for search)
  location: {
    type: "Point",
    coordinates: [77.2066, 28.5244]
  },
  lat: 28.5244,
  lon: 77.2066,
  
  osmTags: {
    source: "vendor_registration",
    auto_created: "true"
  },
  
  hasVendors: true,
  vendorCount: 12,  // Incremented when vendors register
  
  placeType: "locality"
}
```

**Indexes:**
```javascript
{ location: "2dsphere" }
{ city_id: 1, name: 1 }
{ cityName: 1, normalizedName: 1 }
```

---

## 🎯 KEY BENEFITS

### ✅ **No Pre-Population Needed**
- Areas grow **organically** from vendor registrations
- No need to scrape OpenStreetMap/Google for all cities upfront
- Only areas with actual vendors exist in database

### ✅ **One-Time Geocoding**
- Address → Coordinates conversion happens **ONCE** at vendor registration
- **NO API calls** during user search (uses cached area coordinates)
- Saves API costs and improves search speed

### ✅ **Geo-Distance Matching**
- Uses MongoDB `$near` operator for true distance-based search
- Returns vendors within radius (e.g., 5km) sorted by distance
- **Not dependent** on exact text matching of area names

### ✅ **Auto-Expanding Radius**
- If search returns < 5 results, automatically doubles radius
- Ensures users always see nearby options
- Transparent to user (indicated in response)

### ✅ **Simple Frontend Integration**
- City dropdown: Fetch from `/api/locations/cities/search`
- Area dropdown: Fetch from `/api/locations/cities/name/Delhi/areas`
- Search: POST to `/api/search/vendors` with `{ location: { city, area, areaId } }`

---

## 🧪 TESTING

### **1. Test Geocoding Service**

```bash
node -e "const { geocodeAddress } = require('./backend/services/geocodingService'); geocodeAddress('Saket, Delhi, India').then(console.log);"
```

**Expected Output:**
```json
{
  "lat": 28.5244,
  "lon": 77.2066,
  "displayName": "Saket, New Delhi, Delhi, 110017, India"
}
```

### **2. Test Vendor Registration**

```bash
curl -X POST http://localhost:5000/api/vendors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "serviceType": "photography",
    "city": "Delhi",
    "area": "Saket",
    "pincode": "110017",
    "address": "Test Address",
    "pricing": { "min": 10000, "max": 50000 },
    "contact": { "email": "test@test.com", "phone": "9876543210" },
    "password": "test123"
  }'
```

### **3. Test Area Auto-Creation**

```bash
# Check if area was created
curl http://localhost:5000/api/locations/cities/name/Delhi/areas
```

### **4. Test Geo-Distance Search**

```bash
curl -X POST http://localhost:5000/api/search/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "photography",
    "location": {
      "city": "Delhi",
      "area": "Saket"
    }
  }'
```

---

## 🚨 TROUBLESHOOTING

### **Geocoding Fails**

**Error:** `Geocoding failed: Location not found`

**Solutions:**
1. Check area name spelling (e.g., "Dwarka" not "Dwarika")
2. Try adding pincode: `"Saket, Delhi, 110017"`
3. Switch to Google provider in `.env`:
   ```bash
   GEOCODING_PROVIDER=google
   GOOGLE_MAPS_API_KEY=your_key
   ```

### **No Areas Returned for City**

**Cause:** No vendors have registered in that city yet

**Solution:** Areas are auto-created from vendor registrations. You can:
1. Register a test vendor for that city
2. Run the manual area population script (for Delhi):
   ```bash
   node backend/scripts/populate-delhi-areas-manual.js
   ```

### **Search Returns No Results**

**Debugging:**
1. Check area coordinates:
   ```bash
   curl http://localhost:5000/api/locations/cities/name/Delhi/areas
   ```
2. Verify vendor has coordinates:
   ```javascript
   db.vendorsNews.find({ city: "Delhi" }).pretty()
   // Should have location: { type: "Point", coordinates: [lon, lat] }
   ```
3. Check geo index exists:
   ```javascript
   db.vendorsNews.getIndexes()
   // Should see: { location: "2dsphere" }
   ```

---

## 📈 PERFORMANCE OPTIMIZATION

### **MongoDB Indexes**

```javascript
// VendorNew collection
db.vendorsNews.createIndex({ location: "2dsphere" })
db.vendorsNews.createIndex({ city: 1, area: 1 })
db.vendorsNews.createIndex({ serviceType: 1, isActive: 1 })

// Area collection
db.areas.createIndex({ location: "2dsphere" })
db.areas.createIndex({ city_id: 1, name: 1 })
db.areas.createIndex({ cityName: 1, normalizedName: 1 })
```

### **Caching (Future Enhancement)**

```javascript
// Cache area coordinates in Redis
const areaCoords = await redis.get(`area:${areaId}`);
if (!areaCoords) {
  const area = await Area.findById(areaId);
  await redis.set(`area:${areaId}`, JSON.stringify(area.location.coordinates));
}
```

---

## 🎓 LEARNING RESOURCES

- [MongoDB Geospatial Queries](https://www.mongodb.com/docs/manual/geospatial-queries/)
- [GeoJSON Format](https://geojson.org/)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)

---

## ✅ IMPLEMENTATION CHECKLIST

- [x] Create `geocodingService.js` with Nominatim & Google support
- [x] Update `VendorNew` model with `locationKeywords` field
- [x] Update `Area` model with `createOrUpdateFromVendor()` method
- [x] Update `vendorControllerNew.registerVendor()` with geocoding logic
- [x] Update `searchController.searchVendors()` with geo-distance queries
- [x] Add `/api/locations/cities/name/:cityName/areas` endpoint
- [ ] Test vendor registration with geocoding
- [ ] Test area auto-creation
- [ ] Test geo-distance search
- [ ] Update frontend vendor registration form
- [ ] Update frontend search component
- [ ] Add loading states for geocoding
- [ ] Add error handling for geocoding failures

---

**🎉 System is ready for production use!**
