const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Service = require('../models/Service');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkServices() {
  try {
    console.log('\n🔍 CHECKING SERVICES IN DATABASE');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const services = await Service.find({});
    
    console.log(`📊 Total Services Found: ${services.length}\n`);

    if (services.length === 0) {
      console.log('⚠️  No services found in database!');
      console.log('   Vendors need matching services to appear in search results.');
      console.log('\n💡 Solution: Run the service population script to add services.\n');
    } else {
      console.log('📋 Service List:');
      console.log('━'.repeat(70));
      services.forEach((service, idx) => {
        console.log(`\n${idx + 1}. ${service.serviceName}`);
        console.log(`   ID: ${service.serviceId}`);
        console.log(`   Keywords: ${service.keywords.join(', ')}`);
        console.log(`   Active: ${service.isActive ? '✅' : '❌'}`);
        console.log(`   Total Vendors: ${service.totalVendors || 0}`);
      });
      console.log('\n' + '━'.repeat(70));
    }

    // Check vendor service types
    const VendorNew = require('../models/VendorNew');
    const vendorServiceTypes = await VendorNew.distinct('serviceType');
    
    console.log('\n📦 Vendor Service Types in Database:');
    console.log('━'.repeat(70));
    console.log(vendorServiceTypes.join(', '));
    
    // Find mismatches
    const serviceIds = services.map(s => s.serviceId);
    const missingServices = vendorServiceTypes.filter(vst => !serviceIds.includes(vst));
    
    if (missingServices.length > 0) {
      console.log('\n⚠️  MISSING SERVICES:');
      console.log('━'.repeat(70));
      console.log('These service types exist in vendors but NOT in Service model:');
      missingServices.forEach(ms => console.log(`   • ${ms}`));
      console.log('\n💡 These vendors won\'t appear in search until services are created.\n');
    } else if (services.length > 0) {
      console.log('\n✅ All vendor service types have matching services!\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkServices();
