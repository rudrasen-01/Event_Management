# Event Management Platform - Quick Reference

## 🚀 Getting Started

### Installation
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Setup
Create `.env` in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/event-management
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 📊 Architecture

**Data Flow:**
```
Vendor Registration → MongoDB → Search API → Search Results
```

**Key Points:**
- ✅ Database-driven (MongoDB single source of truth)
- ✅ API-driven search with real-time queries
- ✅ No mock/static data in production
- ✅ RESTful API architecture

## 🔧 Development Scripts

Located in `backend/scripts/`:
- `seed-admin.js` - Create admin users (dev only)
- `seed-services.js` - Populate service taxonomy
- `seed-test-vendors.js` - Test vendors for development

**Run seeds:**
```bash
cd backend/scripts
node seed-admin.js
node seed-services.js
node seed-test-vendors.js
```

## 🔍 API Endpoints

**Search:**
- `POST /api/search` - Search vendors with filters

**Vendors:**
- `POST /api/vendors/register` - Register new vendor
- `POST /api/vendors/login` - Vendor login
- `GET /api/vendors/:id` - Get vendor details

**Admin:**
- `POST /api/users/login` - Admin/user login
- `POST /api/users/register` - User registration

## 🐛 Troubleshooting

**No vendors in search?**
1. Check if vendors exist: `db.vendors.find().count()`
2. Check if vendors are active: `db.vendors.find({isActive: true})`
3. Run seed script: `node backend/scripts/seed-test-vendors.js`
4. Check backend logs for search queries

**Vendor can't login?**
- Verify email and password
- Check if vendor exists in database
- Ensure vendor account is active

## 📁 Project Structure

```
Event/
├── backend/
│   ├── controllers/    # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── scripts/       # Dev scripts (seeds)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/  # API calls
│   └── index.html
└── docs/             # Documentation
```

## 📚 Documentation

Detailed docs in `/docs`:
- Architecture & implementation details
- Search implementation guide
- User & admin system
- Service taxonomy

---

*For detailed documentation, see `/docs` directory*
