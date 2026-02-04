# Development Tools

This folder contains scripts and utilities for development, testing, and maintenance. **These are NOT loaded at runtime.**

## 🎯 Quick Reference

### Database Management
```bash
# Check database contents
node dev-tools/check-db.js

# Remove test/seed data
node dev-tools/remove-seed-data.js

# Setup search indexes (for performance)
node dev-tools/setup-search-indexes.js
```

### Admin Management
```bash
# Create first admin user (alternative to seed-admin.js)
node dev-tools/create-admin.js

# Reset admin password to default
node dev-tools/reset-admin-password.js
```

### Testing
```bash
# Test search functionality
node dev-tools/test-search-simple.js
node dev-tools/test-search-discovery.js
node dev-tools/test-search.js

# Test admin API endpoints
node dev-tools/test-admin-api.js
```

### Development Seeding
```bash
# Seed test vendors (requires SEED_TEST_VENDORS=true)
SEED_TEST_VENDORS=true node dev-tools/seed-test-vendors.js

# Seed test inquiries (requires SEED_TEST_INQUIRIES=true)
SEED_TEST_INQUIRIES=true node dev-tools/seed-test-inquiries.js

# Seed Compass vendors
SEED_COMPASS_VENDORS=true node dev-tools/seed-compass-vendors.js

# Seed single vendor
node dev-tools/seed-vendor.js
```

---

## 📝 File Descriptions

### `check-db.js`
Displays current database state (vendors, inquiries, users count)
- **Use when:** Verifying data after seeding or testing

### `remove-seed-data.js`
Removes all test/seed data from database
- **Use when:** Cleaning up before production deployment

### `setup-search-indexes.js`
Creates MongoDB indexes for optimal search performance
- **Use when:** First-time setup or after schema changes

### `create-admin.js`
Creates admin user with default credentials
- Email: `admin@aissignatureevent.com`
- Password: `admin123456`
- **Alternative to:** `scripts/seed-admin.js`

### `reset-admin-password.js`
Resets admin password to default (admin123456)
- **Use when:** Forgot admin password during development

### `test-search-simple.js`
Basic search diagnostics and vendor discovery tests
- Shows database stats
- Tests basic search queries
- Lists available service types

### `test-search-discovery.js`
Comprehensive search test suite (Justdial-grade)
- Tests all search filters
- Budget, location, rating, verification
- Multi-criteria search

### `test-admin-api.js`
Tests admin API endpoints with authentication
- Login test
- Admin stats endpoint test

### `seed-test-vendors.js`
Seeds 5-10 test vendors for development
- ⚠️ Requires `SEED_TEST_VENDORS=true` environment flag

### `seed-test-inquiries.js`
Seeds test vendor and contact inquiries
- ⚠️ Requires `SEED_TEST_INQUIRIES=true` environment flag

### `seed-compass-vendors.js`
Seeds large vendor dataset (Compass data)
- ⚠️ Requires `SEED_COMPASS_VENDORS=true` environment flag

### `seed-vendor.js`
Seeds a single vendor for quick testing

### `test-admin.html`
HTML page for testing admin panel UI
- Open in browser to test frontend admin functionality

---

## ⚠️ Important Notes

1. **Never use these in production** - All scripts are for development only
2. **Environment flags required** - Seed scripts won't run without explicit flags
3. **Not loaded at runtime** - None of these files are imported by `server.js`
4. **Use production scripts instead:**
   - `npm run seed:services` - Initialize service taxonomy
   - `npm run seed:admin` - Create first admin user

---

## 🎨 Usage Examples

### Clean Start
```bash
# Remove all test data
node dev-tools/remove-seed-data.js

# Check it's empty
node dev-tools/check-db.js

# Seed only production data
npm run seed:services
npm run seed:admin
```

### Development Workflow
```bash
# Seed test vendors
SEED_TEST_VENDORS=true node dev-tools/seed-test-vendors.js

# Test search
node dev-tools/test-search-simple.js

# Clean up
node dev-tools/remove-seed-data.js
```

### Search Performance
```bash
# Setup indexes first
node dev-tools/setup-search-indexes.js

# Then test search
node dev-tools/test-search-discovery.js
```

---

**For production setup, see:** `../PRODUCTION-ARCHITECTURE.md`
