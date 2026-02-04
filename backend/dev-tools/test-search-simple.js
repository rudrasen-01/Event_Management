/**
 * Test Search Functionality
 * Checks database vendors and tests search queries
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./models/VendorNew');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const testSearch = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VENDOR SEARCH DIAGNOSTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Check total vendors
    const totalVendors = await Vendor.countDocuments({});
    const activeVendors = await Vendor.countDocuments({ isActive: true });
    
    console.log('📊 DATABASE STATS:');
    console.log(`   Total Vendors: ${totalVendors}`);
    console.log(`   Active Vendors: ${activeVendors}`);
    console.log(`   Inactive Vendors: ${totalVendors - activeVendors}\n`);

    if (totalVendors === 0) {
      console.log('⚠️  No vendors in database!');
      console.log('   Run: node seed-compass-vendors.js\n');
      return;
    }

    // 2. Show sample vendors
    console.log('📋 SAMPLE VENDORS:');
    const samples = await Vendor.find({ isActive: true })
      .select('vendorId name serviceType city area verified rating')
      .limit(3)
      .lean();
    
    samples.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name}`);
      console.log(`      Service: ${v.serviceType}`);
      console.log(`      Location: ${v.area}, ${v.city}`);
      console.log(`      Verified: ${v.verified ? '✓' : '✗'} | Rating: ${v.rating}/5\n`);
    });

    // 3. Test basic search (no filters)
    console.log('🔍 TEST 1: Search ALL active vendors (no filters)');
    const test1 = await Vendor.comprehensiveSearch({
      page: 1,
      limit: 10,
      sort: 'relevance'
    });
    console.log(`   Results: ${test1.total} vendors found`);
    console.log(`   Returned: ${test1.results.length} vendors\n`);

    // 4. Test city search
    if (samples.length > 0) {
      const testCity = samples[0].city;
      console.log(`🔍 TEST 2: Search by city "${testCity}"`);
      const test2 = await Vendor.comprehensiveSearch({
        location: { city: testCity },
        page: 1,
        limit: 10
      });
      console.log(`   Results: ${test2.total} vendors found\n`);
    }

    // 5. Test service type search
    const serviceTypes = await Vendor.distinct('serviceType', { isActive: true });
    console.log('📦 AVAILABLE SERVICE TYPES:');
    serviceTypes.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s}`);
    });
    console.log();

    if (serviceTypes.length > 0) {
      const testService = serviceTypes[0];
      console.log(`🔍 TEST 3: Search by service type "${testService}"`);
      const test3 = await Vendor.comprehensiveSearch({
        serviceType: testService,
        page: 1,
        limit: 10
      });
      console.log(`   Results: ${test3.total} vendors found\n`);
    }

    // 6. Check indexes
    console.log('🗂️  DATABASE INDEXES:');
    const indexes = await Vendor.collection.getIndexes();
    Object.keys(indexes).forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 SEARCH API ENDPOINT:');
    console.log('   POST http://localhost:5000/api/search');
    console.log('   Body: {}  (for all vendors)\n');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error(error);
  }
};

const run = async () => {
  await connectDB();
  await testSearch();
  await mongoose.connection.close();
  console.log('📦 Database connection closed.\n');
};

run();
