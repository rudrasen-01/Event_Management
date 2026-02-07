# Database-Driven Dynamic Keywords System

## 🎯 System Overview

Keywords are now **stored in MongoDB** and fetched **dynamically in real-time** instead of being hardcoded in files. This allows adding/updating keywords **without code changes or redeployment**.

## 📊 Database Structure

### ServiceKeywords Collection

Each document contains:
```javascript
{
  servicePattern: "photo",           // Pattern to match (e.g., "photo" matches "photography")
  keywords: [                        // Array of related search terms
    "photography", "photographer", "photo", 
    "camera", "shoot", "portrait", ...
  ],
  description: "Photography related services",
  priority: 10,                      // Higher = checked first
  isActive: true,                    // Enable/disable pattern
  createdAt: "2026-02-06",
  updatedAt: "2026-02-06"
}
```

### Current Patterns (20 total)
- **photo** (15 keywords) - photography, photographer, camera, shoot...
- **video** (13 keywords) - videography, videographer, cinematic...
- **venue** (17 keywords) - banquet, hall, resort, farmhouse...
- **caterer/catering** (14 keywords) - food, buffet, menu, chef...
- **decoration** (14 keywords) - decorator, decor, flowers, stage...
- **makeup** (12 keywords) - makeup artist, beauty, bridal...
- **mehendi/mehndi** (8 keywords) - henna, hand art...
- **dj** (13 keywords) - music, sound, entertainment...
- **anchor/host** (9 keywords) - emcee, mc, presenter...
- **singer** (9 keywords) - vocalist, music, live...
- **band** (9 keywords) - orchestra, musician...
- **dancer/choreograph** (8 keywords) - performance, sangeet...
- **tent** (9 keywords) - marquee, canopy, pandal...
- **event** (9 keywords) - wedding, party, celebration...
- **wedding** (9 keywords) - marriage, shaadi, bride...
- **corporate** (9 keywords) - business, conference, professional...

## 🔄 How It Works

### 1. Vendor Registration/Update
When a vendor is created or updated:
```javascript
// Pre-save hook in VendorNew.js
1. Vendor serviceType: "corporate-event-photography"
2. Fetch matching patterns from ServiceKeywords collection
   - Matches: "photo", "corporate", "event"
3. Get all keywords from matched patterns
4. Add vendor name, business name, city
5. Store in vendor.searchKeywords array (37 keywords total)
```

### 2. Real-Time Search
When user types in search bar:
```javascript
User types: "camera"
→ Searches vendor.searchKeywords array
→ Finds match in keywords
→ Returns vendor results
```

## 🚀 Setup Instructions

### First Time Setup

```bash
# 1. Seed keywords database (run once)
cd backend
node scripts/seed-service-keywords.js

# 2. Update existing vendors with new keywords
node scripts/update-vendor-keywords-db.js

# 3. Restart backend server
npm run dev
```

### Adding New Keywords

**Option 1: Via Admin API** (Recommended)
```bash
# Add/update keywords for a service pattern
POST http://localhost:5000/api/admin/keywords
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "servicePattern": "dance",
  "keywords": ["dance", "dancer", "performance", "choreography"],
  "description": "Dance related services",
  "priority": 7
}

# After adding keywords, regenerate vendor keywords
POST http://localhost:5000/api/admin/keywords/regenerate
Authorization: Bearer <admin-token>
```

**Option 2: Edit Database Directly**
```javascript
// In MongoDB Compass or shell
db.servicekeywords.insertOne({
  servicePattern: "dance",
  keywords: ["dance", "dancer", "performance"],
  description: "Dance services",
  priority: 7,
  isActive: true
})
```

**Option 3: Update seed script and re-run**
Edit `scripts/seed-service-keywords.js` and run:
```bash
node scripts/seed-service-keywords.js
node scripts/update-vendor-keywords-db.js
```

## 📡 Admin API Endpoints

All endpoints require admin authentication.

### Get All Keywords
```http
GET /api/admin/keywords
Authorization: Bearer <admin-token>
```

### Get Keywords for Specific Pattern
```http
GET /api/admin/keywords/photo
Authorization: Bearer <admin-token>
```

### Add or Update Keywords
```http
POST /api/admin/keywords
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "servicePattern": "makeup",
  "keywords": ["makeup", "makeup artist", "beauty", "cosmetics"],
  "description": "Makeup services",
  "priority": 7
}
```

### Delete Keyword Pattern
```http
DELETE /api/admin/keywords/<pattern-id>
Authorization: Bearer <admin-token>
```

### Get Keyword Suggestions for Service
```http
POST /api/admin/keywords/suggest
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "serviceType": "corporate-event-photography"
}

Response: {
  "success": true,
  "data": {
    "serviceType": "corporate-event-photography",
    "keywords": ["photography", "photographer", "photo", "camera", ...],
    "count": 37
  }
}
```

### Regenerate All Vendor Keywords
```http
POST /api/admin/keywords/regenerate
Authorization: Bearer <admin-token>

Response: {
  "success": true,
  "message": "Vendor keywords regenerated",
  "data": {
    "total": 150,
    "updated": 150,
    "failed": 0
  }
}
```

## ✅ Test Results

### Vendor Keywords (Example)
```javascript
Vendor: "rohit"
Service Type: "corporate-event-photography"

Generated Keywords (37 total):
[
  // Service type itself
  'corporate-event-photography',
  
  // From "photo" pattern
  'photography', 'photographer', 'photo', 'camera', 'shoot', 
  'portrait', 'candid', 'wedding photographer', 'event photography',
  'corporate photography', 'pictures', 'photoshoot', 'image', 
  'snap', 'capture',
  
  // From "corporate" pattern
  'corporate', 'business', 'company', 'office', 'professional',
  'conference', 'seminar', 'meeting', 'enterprise',
  
  // From "event" pattern
  'event', 'wedding', 'party', 'celebration', 'function',
  'ceremony', 'occasion', 'gathering', 'program',
  
  // Vendor-specific
  'rohit', 'reddy', 'indore'
]
```

### Search Tests (All Passing ✅)
| Search Query | Result | Matched Via |
|-------------|--------|-------------|
| "photography" | ✅ Found | searchKeywords |
| "photo" | ✅ Found | searchKeywords |
| "camera" | ✅ Found | searchKeywords |
| "Corporate Event Photography" | ✅ Found | serviceType + keywords |
| "shoot" | ✅ Found | searchKeywords |
| "portrait" | ✅ Found | searchKeywords |
| "corporate" | ✅ Found | searchKeywords |
| "event" | ✅ Found | searchKeywords |
| "rohit" | ✅ Found | name + keywords |
| "indore" | ✅ Found | city + keywords |

## 🎯 Benefits

✅ **No Code Changes** - Add keywords via API or database  
✅ **Real-Time Updates** - Changes reflect immediately  
✅ **Centralized Management** - One place for all keywords  
✅ **Flexible Matching** - Pattern-based matching (e.g., "photo" matches "photography")  
✅ **Priority System** - Control which patterns are checked first  
✅ **Easy Expansion** - Add new services without deployment  
✅ **Vendor-Specific** - Auto-combines with vendor name, city, business name

## 📝 Files Created

- `backend/models/ServiceKeywords.js` - Database model
- `backend/controllers/keywordController.js` - Admin API endpoints
- `backend/scripts/seed-service-keywords.js` - Initial data seeding
- `backend/scripts/update-vendor-keywords-db.js` - Regenerate vendor keywords
- `backend/routes/adminRoutes.js` - Updated with keyword routes

## 📝 Files Modified

- `backend/models/VendorNew.js` - Pre-save hook now fetches from database
- `backend/routes/adminRoutes.js` - Added keyword management endpoints

## 🔄 Migration Steps (Already Done ✅)

1. ✅ Created ServiceKeywords model
2. ✅ Seeded 20 keyword patterns
3. ✅ Updated vendor pre-save hook
4. ✅ Regenerated keywords for existing vendor
5. ✅ Added admin API endpoints
6. ✅ Tested search functionality

## 🚀 Next Steps

1. **Test on frontend** - Verify search bar shows vendors
2. **Add more patterns** - As new services are added
3. **Build admin UI** (optional) - Interface to manage keywords
4. **Monitor performance** - Database queries are fast with indexes

---

**Status:** ✅ COMPLETE - Keywords now stored in database and fetched dynamically!
