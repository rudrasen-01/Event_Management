const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('../models/VendorNew');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const testSearch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Get all active vendors
    console.log('📊 Test 1: All active vendors');
    const all = await Vendor.find({ isActive: true }).select('name city serviceType');
    console.log(`   Found: ${all.length} vendors`);
    all.forEach(v => console.log(`   - ${v.name} (${v.serviceType}) in ${v.city}`));

    // Test 2: Search by city
    console.log('\n📍 Test 2: Search Indore vendors');
    const cityResults = await Vendor.comprehensiveSearch({
      location: { city: 'Indore' }
    });
    console.log(`   Found: ${cityResults.total} vendors`);
    cityResults.results.forEach(v => console.log(`   - ${v.name} (${v.serviceType})`));

    // Test 3: Search by service type
    console.log('\n🎯 Test 3: Search photographers');
    const photoResults = await Vendor.comprehensiveSearch({
      serviceType: 'photographer'
    });
    console.log(`   Found: ${photoResults.total} vendors`);
    photoResults.results.forEach(v => console.log(`   - ${v.name}`));

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testSearch();
