# Backend Seed Scripts Guide

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

## Quick Commands

```bash
# Remove all test data
npm run remove:seed

# Check what's in DB
node scripts/check-db.js

# Seed only if needed for testing
npm run seed:vendors:win
npm run seed:inquiries:win
```
