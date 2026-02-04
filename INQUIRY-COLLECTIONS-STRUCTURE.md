# MongoDB Collections Structure for Inquiries

## Overview
Inquiries are now stored in **2 separate MongoDB collections** for better organization and data management.

---

## 📁 Collections

### 1. **vendorinquiries** (Vendor Inquiries)
**Model:** `VendorInquiry.js`  
**Purpose:** Stores all vendor-specific inquiries from customers

**Key Fields:**
- `inquiryId`: Unique ID (format: `VINQ_timestamp_random`)
- `userName`: Customer name
- `userContact`: Phone number (required)
- `userEmail`: Email (optional)
- `eventType`: Wedding, Birthday, Corporate, etc.
- `budget`: Required for vendor inquiries
- `vendorId`: Reference to specific vendor (REQUIRED)
- `message`: Customer requirements
- `location`: Geo-coordinates
- `city`: Location city
- `status`: pending, contacted, responded, closed, cancelled
- `source`: website, mobile_app, direct
- `vendorResponse`: Response from vendor
- `respondedAt`: Timestamp when vendor responded

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "inquiryId": "VINQ_1738598400000_abc123xyz",
  "userName": "Rudra Patel",
  "userContact": "9876543210",
  "userEmail": "rudra@example.com",
  "eventType": "wedding",
  "budget": 50000,
  "vendorId": "507f191e810c19729de860ea",
  "message": "Need decoration for 200 guests",
  "status": "pending",
  "source": "website",
  "createdAt": "2026-02-03T10:30:00.000Z"
}
```

---

### 2. **contactinquiries** (Contact Form Inquiries)
**Model:** `ContactInquiry.js`  
**Purpose:** Stores general contact/support inquiries (non-vendor specific)

**Key Fields:**
- `inquiryId`: Unique ID (format: `CINQ_timestamp_random`)
- `userName`: Customer name
- `userContact`: Phone number (required)
- `userEmail`: Email (optional)
- `eventType`: Subject/topic of inquiry
- `message`: Detailed message (REQUIRED, min 10 chars)
- `budget`: Optional (default: 0)
- `category`: general, customer-support, vendor-application, partnership, technical, feedback
- `status`: pending, contacted, responded, closed, cancelled
- `source`: website, mobile_app, direct
- `adminResponse`: Response from admin
- `adminNotes`: Internal notes (private)
- `respondedAt`: Timestamp when admin responded

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "inquiryId": "CINQ_1738598450000_xyz789abc",
  "userName": "Anjali Sharma",
  "userContact": "9876543211",
  "userEmail": "anjali@example.com",
  "eventType": "Partnership Inquiry",
  "message": "I want to register my event management company as a vendor",
  "budget": 0,
  "category": "vendor-application",
  "status": "pending",
  "source": "website",
  "createdAt": "2026-02-03T10:31:00.000Z"
}
```

---

## 🔄 How Routing Works

### Backend Controller Logic (`inquiryController.js`)

```javascript
// When creating an inquiry:

if (inquiryType === 'vendor_inquiry' && vendorId) {
  // Save to VendorInquiry collection
  await VendorInquiry.create({ ... });
  // Populates vendor details
  
} else if (inquiryType === 'contact_inquiry') {
  // Save to ContactInquiry collection
  await ContactInquiry.create({ ... });
  // No vendor reference
}
```

### Frontend Routing

**Vendor Card "Send Inquiry" button:**
```javascript
inquiryData = {
  ...formData,
  vendorId: vendor._id,
  inquiryType: 'vendor_inquiry',  // ← Routes to vendorinquiries
  budget: 50000 // Required
}
```

**Contact Page Form:**
```javascript
inquiryData = {
  ...formData,
  inquiryType: 'contact_inquiry',  // ← Routes to contactinquiries
  budget: 0 // Optional
}
```

---

## 🖥️ Backend Console Logs

### When Vendor Inquiry is Submitted:
```
============================================================
📥 NEW INQUIRY RECEIVED
============================================================
📋 Inquiry Type: vendor_inquiry
👤 Customer: Rudra Patel
📞 Contact: 9876543210
🎉 Event Type: wedding
💰 Budget: 50000

🏪 VENDOR-SPECIFIC INQUIRY
🆔 Vendor ID: 507f191e810c19729de860ea
📨 Message: Need decoration services for...
============================================================

✅ VENDOR FOUND:
   Name: Raj Decorators
   Business: Raj Decorations Pvt Ltd
   Service Type: decoration
   Email: raj@decorators.com
   Phone: 9876543210
   City: Indore

💾 Saving to VENDOR INQUIRY collection...

✅ INQUIRY SAVED SUCCESSFULLY
🆔 Inquiry ID: VINQ_1738598400000_abc123xyz
📂 Collection: vendorinquiries
🏪 Vendor: Raj Decorators
📧 Vendor Email: raj@decorators.com
📅 Created: 2026-02-03T10:30:00.000Z
============================================================
```

### When Contact Form is Submitted:
```
============================================================
📥 NEW INQUIRY RECEIVED
============================================================
📋 Inquiry Type: contact_inquiry
👤 Customer: Anjali Sharma
📞 Contact: 9876543211
🎉 Event Type: Partnership Inquiry
💰 Budget: 0

📧 CONTACT FORM INQUIRY (General)
✉️  This is a general contact inquiry, no vendor specified
📨 Message: I want to register my event management...
============================================================

💾 Saving to CONTACT INQUIRY collection...

✅ INQUIRY SAVED SUCCESSFULLY
🆔 Inquiry ID: CINQ_1738598450000_xyz789abc
📂 Collection: contactinquiries
📝 Category: General Contact
📅 Created: 2026-02-03T10:31:00.000Z
============================================================
```

---

## 📊 Database View in MongoDB Compass

```
event-management (Database)
├── vendorinquiries      ← Vendor-specific inquiries
│   ├── VINQ_1738598400000_abc123xyz
│   ├── VINQ_1738598500000_def456uvw
│   └── ... (all vendor inquiries)
│
├── contactinquiries     ← Contact form inquiries
│   ├── CINQ_1738598450000_xyz789abc
│   ├── CINQ_1738598550000_pqr012mno
│   └── ... (all contact inquiries)
│
└── inquiries           ← Legacy collection (for old data)
```

---

## 🔍 Querying Data

### Get All Vendor Inquiries:
```javascript
const vendorInquiries = await VendorInquiry.find()
  .populate('vendorId')
  .sort({ createdAt: -1 });
```

### Get All Contact Inquiries:
```javascript
const contactInquiries = await ContactInquiry.find()
  .sort({ createdAt: -1 });
```

### Get Inquiries for Specific Vendor:
```javascript
const inquiries = await VendorInquiry.find({ 
  vendorId: '507f191e810c19729de860ea' 
});
```

### Get Combined View (Both Collections):
```javascript
const allInquiries = await Promise.all([
  VendorInquiry.find().populate('vendorId'),
  ContactInquiry.find()
]);
```

---

## ✅ Benefits of Separate Collections

1. **Clear Separation**: Vendor inquiries aur contact inquiries clearly separated
2. **Optimized Queries**: Faster queries (don't need to filter by inquiryType)
3. **Different Schemas**: Each type ka apna validation rules
4. **Scalability**: Easy to add type-specific features
5. **Admin Dashboard**: Easy to show separate tabs for each type
6. **Analytics**: Better reporting (vendor conversion vs general inquiries)

---

## 🚀 Migration Notes

**Existing data in old `inquiries` collection:**
- Will remain in `inquiries` collection
- New inquiries automatically route to correct collection
- Can write migration script to move old data if needed

---

## 📝 Future Enhancements

1. Add separate routes for fetching each collection
2. Create admin dashboard with tabs: "Vendor Inquiries" | "Contact Inquiries"
3. Add analytics for conversion rates
4. Email notifications based on inquiry type
5. Automated responses for contact inquiries

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Implemented and Tested
