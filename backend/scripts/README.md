# Backend Seed Scripts Guide ...

## Overview
Seed scripts populate the database with initial or test data. Most are **optional** and should only be run for development/testing.

## Required Scripts (Run Once for Setup)

### 1. `seed-services.js` - **REQUIRED**
Creates service types and taxonomy (photographer, caterer, etc.)
```bash
node scripts/seed-services.js
```
**Why required:** Vendors register under service types. Without this, vendor registration won't work.

### 2. `seed-admin.js` - **REQUIRED**
Creates initial admin user for accessing admin panel
```bash
node scripts/seed-admin.js
```
**Default credentials:**
- Email: `admin@ais.com`
- Password: `admin123`

---

## Optional Test Data Scripts (Development Only)

These scripts insert **static test data** and are **guarded** - they won't run unless you explicitly enable them with environment variables.

### `seed-test-vendors.js`
Inserts 6 test vendors (Royal Wedding Photography, Divine Caterers, etc.)
```bash
# Windows
npm run seed:vendors:win

# Or manually with env flag
set "SEED_TEST_VENDORS=true" && node scripts/seed-test-vendors.js
```

### `seed-compass-vendors.js`
Inserts 20 production-grade sample vendors
```bash
# Windows
npm run seed:compass:win

# Or manually
set "SEED_COMPASS_VENDORS=true" && node scripts/seed-compass-vendors.js
```

### `seed-test-inquiries.js`
Inserts 5 test inquiries (vendor + contact inquiries)
```bash
# Windows
npm run seed:inquiries:win

# Or manually
set "SEED_TEST_INQUIRIES=true" && node scripts/seed-test-inquiries.js
```

---

## Utility Scripts

### `remove-seed-data.js`
Removes all seeded test vendors and inquiries
```bash
npm run remove:seed
# or
node scripts/remove-seed-data.js
```

### `check-db.js`
Shows current database contents (counts + sample documents)
```bash
node scripts/check-db.js
```

---

## Production Workflow

**For production, you only need:**
1. Run `seed-services.js` once (creates service taxonomy)
2. Run `seed-admin.js` once (creates admin user)
3. Let vendors register through the UI (dynamic data from forms)
4. Let users submit inquiries through the UI (dynamic data from forms)

**Never run test seed scripts in production.**

---

## How Data Should Flow in Production

```
User Form → POST /api/inquiries → MongoDB (vendorinquiries/contactinquiries)
Vendor Registration → POST /api/vendors/register → MongoDB (vendors collection)
Admin Panel → GET /api/admin/* → Fetch from MongoDB → Display in UI
```

✅ **All data is dynamic and fetched from the database**
❌ **No hardcoded vendor/inquiry arrays in frontend code**

---

## Geo-Location Scripts

These scripts populate location data (cities and areas) from OpenStreetMap for geo-based vendor search.

### `populate-indore-areas.js`
Populates all areas/localities of Indore from OpenStreetMap
```bash
node scripts/populate-indore-areas.js
```
**What it does:**
- Fetches all suburbs, neighbourhoods, and localities in Indore from OpenStreetMap
- Inserts unique areas into the Area collection
- Updates the City document with area count
- Skips duplicates automatically

**Output:** Comprehensive area coverage for Indore with geo-coordinates for radius-based search.

### `populate-mp-areas.js`
Populates areas for all major Madhya Pradesh cities
```bash
node scripts/populate-mp-areas.js
```

### `populate-delhi-areas-manual.js`
Populates manually curated popular areas for Delhi NCR cities
```bash
node scripts/populate-delhi-areas-manual.js
```

### `populate-indore-areas-manual.js`
Populates 75+ manually curated areas of Indore with accurate coordinates
```bash
node scripts/populate-indore-areas-manual.js
```
**What it does:**
- Inserts 75+ verified Indore localities with accurate lat/lon coordinates
- Covers major areas: Vijay Nagar, Palasia, MG Road, AB Road, etc.
- Ensures precise geospatial search capability

**Output:** 76 total Indore areas with verified coordinates for distance-based search.

### `populate-delhi-ncr-areas-comprehensive.js` - **RECOMMENDED FOR DELHI NCR**
Populates comprehensive areas across entire Delhi NCR region
```bash
node scripts/populate-delhi-ncr-areas-comprehensive.js
```
**Coverage:**
- Delhi: 134 areas
- New Delhi: 12 areas  
- Noida: 14 areas
- Greater Noida: 15 areas
- Ghaziabad: 10 areas
- Gurgaon (Gurugram): 18 areas
- Faridabad: 11 areas
- Sonipat: 6 areas
- Bahadurgarh: 5 areas

**Total:** 225 areas with standardized lat/lon coordinates for entire NCR.

### Other geo-location utilities:
- `check-states.js` - Verify states in database
- `check-delhi-cities.js` - Check Delhi NCR cities
- `check-mp-cities.js` - Check MP cities
- `find-mp-cities.js` - Find and list MP cities
- `test-geo-location-system.js` - Test geo-location search functionality
- `add-indore-city.js` - Add/verify Indore city in database

---

## Testing Scripts

### `test-unified-search.js` - **COMPREHENSIVE SEARCH TESTING**
Tests the unified vendor search system with 18 comprehensive test scenarios
```bash
node scripts/test-unified-search.js
```

**What it tests:**
- ✅ Four-tier priority ordering (Exact Area → Nearby → Same City → Adjacent City)
- ✅ Location resolution strategies (coordinates, areaId, city+area, city center)
- ✅ Budget filtering (strict mode for nearby, flexible ±20% for distant)
- ✅ Radius-based geospatial search with distance calculations
- ✅ Service type, verified, rating, and text query filters
- ✅ Pagination functionality
- ✅ Combined filter interactions
- ✅ Zero-result prevention with adjacent city inclusion
- ✅ Haversine distance calculation accuracy
- ✅ Response format and metadata validation

**Prerequisites:**
- Database must have cities and areas populated
- At least one city with areas (Delhi or Indore recommended)
- Some vendors in the database (for meaningful results)

**Output:** Detailed test report with pass/fail status for each scenario, search quality metrics, and tier breakdown analysis.

---

## Quick Commands

```bash
# Remove all test data
npm run remove:seed

# Check what's in DB
node scripts/check-db.js

# Seed only if needed for testing
npm run seed:vendors:win
npm run seed:inquiries:win

# Test unified search system
node scripts/test-unified-search.js

# Populate Delhi NCR areas (recommended)
node scripts/populate-delhi-ncr-areas-comprehensive.js

# Populate Indore areas
node scripts/populate-indore-areas-manual.js
```
