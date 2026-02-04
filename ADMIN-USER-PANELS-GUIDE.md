# Admin & User Panels Implementation Guide

## 🎯 Overview
Professional admin and user dashboards with role-based access control, real-time statistics, and modern UI components.

---

## 📁 Project Structure

### Backend Files Created
```
backend/
├── controllers/
│   └── adminController.js       ← Admin operations (stats, users, vendors, inquiries)
├── middleware/
│   └── adminMiddleware.js       ← Role-based access control
└── routes/
    └── adminRoutes.js           ← Admin API endpoints
```

### Frontend Files Created
```
frontend/src/
├── components/
│   ├── StatsCard.jsx            ← Statistics display card
│   ├── StatusBadge.jsx          ← Status indicator badges
│   ├── ModalDialog.jsx          ← Modal component
│   └── DataTable.jsx            ← Data table with pagination
└── pages/
    ├── AdminDashboardNew.jsx    ← Admin panel
    └── UserDashboardNew.jsx     ← User dashboard
```

---

## 🔐 Admin Panel Features

### Access the Admin Panel
**Route:** `/admin/dashboard`  
**Login Required:** Yes (Admin role)

### 1. Dashboard Overview Tab
- **Total Users** - Count of registered customers
- **Total Vendors** - All vendors (verified + unverified)
- **Total Inquiries** - Vendor + Contact inquiries combined
- **Pending Inquiries** - Inquiries awaiting response
- **Recent Activity** - Latest vendor and contact inquiries

### 2. Vendors Management Tab
**Features:**
- View all vendors with pagination
- Search by name, email, business name
- Filter by verification status
- Filter by service type and city
- Verify/Unverify vendors
- View vendor details in modal
- Delete vendors

**Table Columns:**
- Business Name & Email
- Service Type
- City
- Verification Status
- Actions (View/Edit)

### 3. Inquiries Management Tab
**Features:**
- View both Vendor Inquiries and Contact Inquiries
- Embedded vendor details for vendor inquiries
- Update inquiry status
- Add admin notes (for contact inquiries)
- Filter by type and status
- Pagination support

**Table Columns:**
- Inquiry ID
- Customer Name & Contact
- Inquiry Type (Vendor/Contact)
- Vendor Name (for vendor inquiries)
- Status Badge
- Created Date

### 4. Users Management Tab
**Features:**
- View all registered users
- Search by name, email, phone
- Filter by active/inactive status
- Activate/Deactivate users
- Change user roles (user ↔ admin)
- View user activity

**Table Columns:**
- Name & Email
- Phone Number
- Account Status
- Join Date

---

## 👤 User Dashboard Features

### Access the User Dashboard
**Route:** `/user/dashboard`  
**Login Required:** Yes (User role)

### 1. Profile Tab
**Features:**
- View personal information
- Edit profile (name, email, phone)
- See member since date
- Profile picture upload (future)

**Editable Fields:**
- Full Name
- Email Address
- Phone Number

### 2. My Inquiries Tab
**Features:**
- View all inquiries submitted by user
- Filter by status
- View inquiry details in modal
- Track inquiry status (pending → contacted → responded → closed)
- See embedded vendor details for vendor inquiries

**Inquiry Card Shows:**
- Vendor/Event name
- Status badge
- Date submitted
- Budget
- Service type and city (for vendor inquiries)

### 3. Favorites Tab (Coming Soon)
**Features:**
- Save favorite vendors
- Quick access to saved vendors
- Remove from favorites

---

## 🔌 Backend API Endpoints

### Admin Routes (Protected - Admin Only)

#### 1. Get Dashboard Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalVendors": 45,
      "verifiedVendors": 32,
      "totalInquiries": 320,
      "pendingInquiries": 45
    },
    "recentActivity": {
      "vendorInquiries": [...],
      "contactInquiries": [...]
    },
    "trends": {
      "inquiryTrends": [...],
      "vendorsByService": [...]
    }
  }
}
```

#### 2. Get All Users
```http
GET /api/admin/users?page=1&limit=20&search=john&status=active
Authorization: Bearer <admin_token>
```

#### 3. Update User Status
```http
PATCH /api/admin/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": true,
  "role": "admin"
}
```

#### 4. Get All Vendors
```http
GET /api/admin/vendors?page=1&limit=20&verified=true&serviceType=decoration
Authorization: Bearer <admin_token>
```

#### 5. Verify/Unverify Vendor
```http
PATCH /api/admin/vendors/:vendorId/verify
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "verified": true
}
```

#### 6. Get All Inquiries
```http
GET /api/admin/inquiries?page=1&limit=20&type=vendor&status=pending
Authorization: Bearer <admin_token>
```

#### 7. Update Inquiry Status
```http
PATCH /api/admin/inquiries/:inquiryId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "contacted",
  "type": "vendor",
  "notes": "Followed up with customer"
}
```

---

## 🎨 UI Components Documentation

### 1. StatsCard Component
```jsx
<StatsCard
  title="Total Users"
  value={150}
  icon={Users}
  color="blue"
  trend="up"
  trendValue="+12%"
  description="Active users"
  onClick={() => handleCardClick()}
/>
```

**Props:**
- `title` - Card title
- `value` - Main statistic value
- `icon` - Lucide icon component
- `color` - 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
- `trend` - 'up' | 'down' | 'neutral'
- `trendValue` - Trend percentage/text
- `description` - Optional description
- `onClick` - Optional click handler

### 2. StatusBadge Component
```jsx
<StatusBadge status="pending" size="md" dot={true} />
```

**Status Types:**
- `pending` - Yellow
- `contacted` - Blue
- `responded` - Purple
- `closed` - Gray
- `cancelled` - Red
- `active` - Green
- `inactive` - Gray
- `verified` - Green
- `unverified` - Orange

### 3. DataTable Component
```jsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> }
  ]}
  data={users}
  currentPage={1}
  totalPages={10}
  onPageChange={setPage}
  onSort={(key, direction) => handleSort(key, direction)}
  onRowClick={(row) => handleRowClick(row)}
  loading={false}
  emptyMessage="No data found"
/>
```

### 4. ModalDialog Component
```jsx
<ModalDialog
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Vendor Details"
  size="lg"
  showCloseButton={true}
  footer={
    <div>
      <button>Cancel</button>
      <button>Save</button>
    </div>
  }
>
  <p>Modal content here</p>
</ModalDialog>
```

---

## 🔒 Role-Based Access Control

### Admin Middleware
**File:** `backend/middleware/adminMiddleware.js`

**How it works:**
1. Extracts JWT token from Authorization header
2. Verifies token validity
3. Fetches user from database
4. Checks if user role is 'admin'
5. Attaches user to request object
6. Proceeds to route handler or returns 403 Forbidden

**Usage:**
```javascript
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/admin/stats', adminOnly, controller.getStats);
```

### Frontend Protection
**Use ProtectedRoute component:**
```jsx
<Route path="/admin/dashboard" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboardNew />
  </ProtectedRoute>
} />
```

---

## 🚀 Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

**Environment Variables (.env):**
```env
JWT_SECRET=your-super-secret-jwt-key-here
MONGO_URI=mongodb://localhost:27017/event-management
PORT=5000
```

### 2. Create Admin User
Run seed script:
```bash
node backend/seed-admin.js
```

**Default Admin Credentials:**
- Email: `admin@aissignatureevent.com`
- Password: `admin123456`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Panels
- **Admin Panel:** http://localhost:5173/admin/dashboard
- **User Dashboard:** http://localhost:5173/user/dashboard

---

## 📊 Database Collections Used

### 1. users
- Stores user and admin accounts
- Fields: name, email, password (hashed), role, phone, isActive

### 2. vendorinquiries
- Vendor-specific inquiries with embedded vendor details
- Fields: userName, userContact, eventType, budget, vendorId, vendorDetails, status

### 3. contactinquiries
- General contact/support inquiries
- Fields: userName, userContact, eventType, message, category, adminNotes, status

### 4. vendors (VendorNew)
- Vendor profiles
- Fields: businessName, serviceType, contact, address, verified, rating

---

## 🎯 Key Features Implemented

✅ **Admin Dashboard**
- Real-time statistics
- Recent activity feed
- Vendor management with verification
- Inquiry management (both types)
- User management with role control

✅ **User Dashboard**
- Profile management with edit functionality
- Inquiry history with detailed view
- Status tracking for all inquiries
- Favorites placeholder

✅ **Security**
- JWT-based authentication
- Role-based access control
- Admin-only protected routes
- Token expiry handling

✅ **UI/UX**
- Modern, clean design with Tailwind CSS
- Responsive layout (mobile-friendly)
- Loading states and animations
- Interactive data tables with sorting
- Modal dialogs for detailed views
- Color-coded status badges

✅ **Performance**
- Pagination for large datasets
- Efficient database queries
- Lazy loading of data
- Optimized API endpoints

---

## 🔧 Customization Guide

### Change Admin Email/Password
Edit `backend/seed-admin.js` and run:
```bash
node backend/seed-admin.js
```

### Add New Status Type
1. Update `StatusBadge.jsx` statusConfig
2. Update model enum arrays
3. Update backend validation

### Add New Tab to Admin Panel
```jsx
// In AdminDashboardNew.jsx
const tabs = [
  ...existingTabs,
  { id: 'settings', label: 'Settings', icon: Settings }
];

// Add tab content
{activeTab === 'settings' && (
  <div>Settings content</div>
)}
```

### Customize Stats Cards
```jsx
<StatsCard
  title="Custom Metric"
  value={customValue}
  icon={CustomIcon}
  color="indigo"
  trend="up"
  trendValue="+5%"
/>
```

---

## 📱 Mobile Responsiveness

All panels are fully responsive:
- **Desktop (lg):** Full sidebar + content
- **Tablet (md):** Stacked layout with collapsible sections
- **Mobile (sm):** Single column with bottom navigation

---

## 🐛 Troubleshooting

### Admin Panel Not Loading Stats
**Issue:** API returning 401 Unauthorized  
**Solution:** Check if admin token is valid in localStorage

### User Can't See Inquiries
**Issue:** No inquiries displayed in user dashboard  
**Solution:** Ensure inquiry was created with user's email/phone

### Verification Toggle Not Working
**Issue:** Vendor verification status not updating  
**Solution:** Check admin middleware is applied to route

---

## 🚀 Future Enhancements

1. **Analytics Dashboard**
   - Revenue charts
   - Conversion funnels
   - Geographic distribution maps

2. **Bulk Actions**
   - Bulk verify vendors
   - Bulk update inquiry status
   - Export to CSV/Excel

3. **Real-time Notifications**
   - WebSocket for live updates
   - Push notifications
   - Email alerts

4. **Advanced Filters**
   - Date range picker
   - Multi-select filters
   - Saved filter presets

5. **User Features**
   - Favorite vendors
   - Save searches
   - Event reminders
   - Vendor reviews and ratings

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
