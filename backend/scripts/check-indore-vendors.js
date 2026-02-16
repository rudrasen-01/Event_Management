const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const VendorNew = require('../models/VendorNew');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkIndoreVendors() {
  try {
    console.log('\n🔍 CHECKING INDORE VENDORS');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all vendors in Indore
    const indoreVendors = await VendorNew.find({ 
      city: /indore/i 
    }).select('name serviceType city area email approvalStatus status verified');

    console.log(`📊 Total Vendors Found in Indore: ${indoreVendors.length}\n`);

    if (indoreVendors.length === 0) {
      console.log('❌ No vendors found in Indore!\n');
    } else {
      console.log('📋 Vendor List:');
      console.log('━'.repeat(70));
      indoreVendors.forEach((vendor, idx) => {
        console.log(`\n${idx + 1}. ${vendor.name}`);
        console.log(`   Service: ${vendor.serviceType}`);
        console.log(`   City: ${vendor.city}`);
        console.log(`   Area: ${vendor.area || 'N/A'}`);
        console.log(`   Email: ${vendor.email}`);
        console.log(`   Approval: ${vendor.approvalStatus}`);
        console.log(`   Status: ${vendor.status}`);
        console.log(`   Verified: ${vendor.verified ? '✅' : '❌'}`);
      });
      console.log('\n' + '━'.repeat(70));

      // Check approval status breakdown
      const approved = indoreVendors.filter(v => v.approvalStatus === 'approved').length;
      const pending = indoreVendors.filter(v => v.approvalStatus === 'pending').length;
      const rejected = indoreVendors.filter(v => v.approvalStatus === 'rejected').length;
      
      console.log('\n📊 Approval Status Breakdown:');
      console.log(`   ✅ Approved: ${approved}`);
      console.log(`   ⏳ Pending: ${pending}`);
      console.log(`   ❌ Rejected: ${rejected}`);

      // Check active status
      const active = indoreVendors.filter(v => v.status === 'active').length;
      const inactive = indoreVendors.filter(v => v.status === 'inactive').length;
      
      console.log('\n📊 Active Status Breakdown:');
      console.log(`   ✅ Active: ${active}`);
      console.log(`   ❌ Inactive: ${inactive}`);

      // Check which vendors will show in search
      const searchable = indoreVendors.filter(v => 
        v.approvalStatus === 'approved' && 
        v.status === 'active'
      ).length;

      console.log('\n🔎 Searchable Vendors (approved + active):');
      console.log(`   Total: ${searchable} vendors`);
      
      if (searchable < indoreVendors.length) {
        console.log('\n⚠️  Some vendors won\'t appear in search:');
        indoreVendors.forEach((vendor) => {
          if (vendor.approvalStatus !== 'approved' || vendor.status !== 'active') {
            console.log(`   • ${vendor.name}: ${vendor.approvalStatus}, ${vendor.status}`);
          }
        });
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkIndoreVendors();
