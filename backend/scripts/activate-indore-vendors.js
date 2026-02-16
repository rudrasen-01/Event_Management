const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const VendorNew = require('../models/VendorNew');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function activateIndoreVendors() {
  try {
    console.log('\n⚡ ACTIVATING INDORE VENDORS');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update all Indore vendors to be active
    const result = await VendorNew.updateMany(
      { 
        city: /indore/i
      },
      { 
        $set: { 
          isActive: true,
          verified: true
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} vendors`);
    console.log(`   • isActive: true`);
    console.log(`   • verified: true`);

    // Verify the update
    const indoreVendors = await VendorNew.find({ 
      city: /indore/i 
    }).select('name serviceType isActive verified');

    console.log('\n📊 Updated Vendor Status:');
    console.log('━'.repeat(70));
    
    const searchable = indoreVendors.filter(v => 
      v.isActive === true
    );

    console.log(`✅ Total Searchable Vendors: ${searchable.length}/${indoreVendors.length}\n`);

    searchable.forEach((vendor, idx) => {
      console.log(`${idx + 1}. ${vendor.name} (${vendor.serviceType})`);
    });

    console.log('\n━'.repeat(70));
    console.log('✅ All vendors are now active and searchable!');
    console.log('💡 Refresh the frontend to see all vendors.');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

activateIndoreVendors();
