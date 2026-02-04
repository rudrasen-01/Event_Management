# Production Architecture - Database-First Event Management Platform

## ✅ Architecture Philosophy

This is a **production-grade, database-first architecture** where:
- **Single Source of Truth:** MongoDB is the only data source
- **Zero Static Data:** No hardcoded arrays, mocks, or test logic in runtime
- **API-Driven UI:** Every screen fetches live data via REST APIs
- **Role-Based Access:** USER → VENDOR → ADMIN hierarchy with proper middleware protection

---

## 📁 Folder Structure (Production)

```
backend/
├── config/          # Database and environment configuration
├── controllers/     # Business logic (DB queries only)
├── middleware/      # Auth, admin, error handling
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── utils/           # Helper functions
├── scripts/         # Production setup scripts
│   ├── seed-services.js   # Initialize service taxonomy (run once)
│   └── seed-admin.js       # Create first admin user (run once)
├── dev-tools/       # Development utilities (NOT loaded at runtime)
│   ├── check-db.js
│   ├── remove-seed-data.js
│   └── seed-test-*.js
├── server.js        # Application entry point
└── package.json
```

---

## 🔄 Data Flow (Production)

### 1. Vendor Onboarding
```
Vendor UI Form → POST /api/vendors/register 
  → VendorController.register() 
  → Vendor.create() 
  → MongoDB (vendors collection)
  → Admin approval required
```

### 2. Search & Discovery
```
User searches → POST /api/search 
  → SearchController.search() 
  → Vendor.comprehensiveSearch() 
  → Query MongoDB with filters
  → Return only verified, active vendors
```

### 3. Inquiry Creation
```
User/Vendor form → POST /api/inquiries 
  → InquiryController.createInquiry() 
  → VendorInquiry.create() OR ContactInquiry.create()
  → MongoDB (vendorinquiries / contactinquiries)
  → Real-time reflection in dashboards
```

### 4. Admin Management
```
Admin Panel → GET /api/admin/vendors 
  → AdminController.getAllVendors() 
  → Vendor.find() with filters/pagination
  → Returns live DB data
```

---

## 🔐 Role-Based Access Control

### Middleware Protection
- `authMiddleware.protect` → Verifies JWT token
- `adminMiddleware.adminOnly` → Restricts to role: 'admin'

### API Access Matrix

| Endpoint | USER | VENDOR | ADMIN |
|----------|------|--------|-------|
| POST /api/users/register | ✅ | ✅ | ✅ |
| POST /api/users/login | ✅ | ✅ | ✅ |
| GET /api/search | ✅ | ✅ | ✅ |
| POST /api/inquiries | ✅ | ❌ | ✅ |
| GET /api/inquiries/vendor/:id | ❌ | ✅ (own) | ✅ |
| POST /api/vendors/register | ❌ | ✅ | ✅ |
| GET /api/admin/* | ❌ | ❌ | ✅ |
| PATCH /api/admin/vendors/:id/verify | ❌ | ❌ | ✅ |

---

## 🚀 Initial Setup (First Time Only)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-production-secret-key-change-this
NODE_ENV=production
```

### Step 3: Seed Core Data (Once)
```bash
# Creates service types (photographer, caterer, etc.)
npm run seed:services

# Creates first admin user
npm run seed:admin
```

**Default Admin Credentials:**
- Email: `admin@ais.com`
- Password: `admin123`

⚠️ **Change these immediately in production!**

### Step 4: Start Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📊 Database Collections

### Production Collections
- `vendors` - All registered vendors
- `users` - Customer accounts
- `services` - Service taxonomy (photographer, caterer, etc.)
- `vendorinquiries` - Vendor-specific inquiry requests
- `contactinquiries` - General contact form submissions

### Key Indexes
- `vendors`: `{ serviceType: 1, city: 1, verified: 1 }`
- `vendors`: `{ location: '2dsphere' }` (geospatial)
- `vendorinquiries`: `{ vendorId: 1, status: 1 }`
- `contactinquiries`: `{ status: 1, createdAt: -1 }`

---

## 🎯 API Endpoints (Core)

### Public APIs
```
GET  /api/services              - List all service types
POST /api/search                - Search vendors with filters
GET  /api/search/vendor/:id     - Get vendor details
POST /api/inquiries             - Create inquiry
POST /api/users/register        - User registration
POST /api/users/login           - User/Admin login
POST /api/vendors/register      - Vendor registration
```

### Protected APIs (User)
```
GET  /api/users/profile         - Get user profile
PUT  /api/users/profile         - Update profile
GET  /api/inquiries             - Get user's inquiries
```

### Protected APIs (Vendor)
```
GET  /api/inquiries/vendor/:id  - Get vendor inquiries
PUT  /api/vendors/:id           - Update vendor profile
```

### Protected APIs (Admin)
```
GET  /api/admin/stats           - Dashboard statistics
GET  /api/admin/vendors         - All vendors (with filters)
GET  /api/admin/inquiries       - All inquiries (both types)
GET  /api/admin/users           - All users
PATCH /api/admin/vendors/:id/verify - Verify vendor
PATCH /api/admin/users/:id      - Update user status
```

---

## 🔧 Controller Guidelines

Every controller must:
1. **Query database directly** - No intermediate static data
2. **Apply filters at DB level** - Use Mongoose query operators
3. **Implement pagination** - Return `page`, `limit`, `totalPages`
4. **Handle errors properly** - Use `next(error)` for error middleware
5. **Return consistent structure:**
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

### Example: Admin Controller
```javascript
exports.getAllVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, verified, city } = req.query;
    
    const query = {};
    if (verified !== undefined) query.verified = verified === 'true';
    if (city) query.city = new RegExp(city, 'i');
    
    const skip = (page - 1) * limit;
    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Vendor.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        vendors,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🎨 Frontend Guidelines

### API Integration Pattern
```javascript
const fetchVendors = async (filters) => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setVendors(data.data.results);
    }
  } catch (error) {
    console.error('Error:', error);
    setVendors([]); // Empty state, NOT fallback data
  } finally {
    setLoading(false);
  }
};
```

### ❌ Never Do This
```javascript
// DON'T: Hardcoded fallback data
const mockVendors = [{ name: 'Test', ... }];
setVendors(data.vendors || mockVendors); // BAD

// DO: Empty state
setVendors(data.vendors || []); // GOOD
```

---

## 🧪 Development Tools (dev-tools/)

These scripts are **NOT** loaded at runtime:

### Available Scripts
```bash
# Check database contents
npm run db:check

# Remove seeded test data
npm run db:clean
```

### Manual Seed (Development Only)
```bash
cd backend/dev-tools

# Windows
set "SEED_TEST_VENDORS=true" && node seed-test-vendors.js
set "SEED_TEST_INQUIRIES=true" && node seed-test-inquiries.js
```

⚠️ **Never run these in production**

---

## 📈 Scalability Considerations

### Database Optimization
- Geospatial indexes for location-based search
- Compound indexes on frequently queried fields
- Text indexes for search functionality
- Aggregation pipelines for dashboard stats

### API Performance
- Implement query result caching (Redis)
- Rate limiting on public endpoints
- Pagination on all list endpoints
- Lean queries for read-only operations

### Security
- JWT token expiration and rotation
- Input validation and sanitization
- CORS configuration
- Environment variable encryption
- Password hashing (bcrypt)

---

## 🏗️ Production Deployment Checklist

- [ ] Change default admin credentials
- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB replica set
- [ ] Enable MongoDB authentication
- [ ] Set NODE_ENV=production
- [ ] Configure CORS whitelist
- [ ] Enable HTTPS
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Remove dev-tools from production build
- [ ] Configure rate limiting
- [ ] Set up health check monitoring

---

## 🎯 Expected Behavior

**Like Justdial/Urban Company:**
- Real-time data updates
- Scalable search with filters
- Role-based dashboards
- Approval workflows
- Review system
- Analytics and reporting

**Every Record Must:**
- Exist in MongoDB
- Be queryable via API
- Reflect immediately in UI
- Support CRUD operations
- Have audit trail (timestamps)

---

## 📞 Support & Maintenance

### Logs
```bash
# Application logs
pm2 logs

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Common Issues
**No vendors in search:**
- Check if vendors are `verified: true` and `isActive: true`
- Run `npm run db:check` to verify data

**Admin can't login:**
- Verify user exists with `role: 'admin'`
- Check JWT_SECRET matches in .env

**API returns empty:**
- Check MongoDB connection
- Verify collection names match models
- Check query filters in controller

---

**This is a production-ready, database-first architecture with zero static data dependencies.**
