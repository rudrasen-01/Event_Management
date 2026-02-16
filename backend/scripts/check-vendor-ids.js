require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../models/VendorNew');

async function checkVendorIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Checking vendor IDs and profile accessibility...\n');
    
    const vendors = await Vendor.find({ city: /indore/i })
      .select('_id name businessName city area serviceType isActive verified')
      .limit(5);
    
    console.log(`Found ${vendors.length} Indore vendors:\n`);
    
    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.businessName || vendor.name}`);
      console.log(`   ID: ${vendor._id}`);
      console.log(`   Type: ${vendor.serviceType}`);
      console.log(`   Location: ${vendor.area}, ${vendor.city}`);
      console.log(`   Active: ${vendor.isActive}`);
      console.log(`   Verified: ${vendor.verified}`);
      console.log(`   Profile URL: http://localhost:3000/vendor/${vendor._id}`);
      console.log(`   API URL: http://localhost:5000/api/vendor-profile/${vendor._id}`);
      console.log('');
    });
    
    // Test if vendor profile endpoint would work
    const testVendor = vendors[0];
    if (testVendor) {
      console.log('Profile accessibility check:');
      console.log(`   Vendor: ${testVendor.businessName || testVendor.name}`);
      console.log(`   Has _id: ${!!testVendor._id}`);
      console.log(`   Is Active: ${testVendor.isActive}`);
      console.log(`   Is Verified: ${testVendor.verified}`);
      console.log(`   Will show publicly: ${testVendor.isActive && testVendor.verified ? '✅ YES' : '❌ NO'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVendorIds();
