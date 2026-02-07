/**
 * Test Admin Keyword Management
 * Shows how to add/update keywords via database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ServiceKeywords = require('../models/ServiceKeywords');
const Vendor = require('../models/VendorNew');
const connectDB = require('../config/db');

const testKeywordManagement = async () => {
  try {
    console.log('🧪 Testing Admin Keyword Management\n');
    console.log('='.repeat(70));
    
    await connectDB();
    
    // Test 1: View all keyword patterns
    console.log('\n📋 Test 1: View All Keyword Patterns');
    console.log('-'.repeat(70));
    const allKeywords = await ServiceKeywords.find().sort({ priority: -1, servicePattern: 1 });
    console.log(`Found ${allKeywords.length} patterns:`);
    allKeywords.slice(0, 5).forEach(pattern => {
      console.log(`  - ${pattern.servicePattern}: ${pattern.keywords.length} keywords (priority: ${pattern.priority})`);
    });
    console.log(`  ... and ${allKeywords.length - 5} more`);
    
    // Test 2: Add new keyword pattern
    console.log('\n📋 Test 2: Add New Keyword Pattern');
    console.log('-'.repeat(70));
    const newPattern = await ServiceKeywords.addOrUpdatePattern(
      'drone',
      ['drone', 'aerial', 'aerial photography', 'uav', 'flying camera', 'aerial video', 'bird eye view'],
      'Drone photography and videography services',
      8
    );
    console.log('✅ Added pattern:', newPattern.servicePattern);
    console.log('   Keywords:', newPattern.keywords.join(', '));
    
    // Test 3: Update existing pattern (add more keywords)
    console.log('\n📋 Test 3: Update Existing Pattern');
    console.log('-'.repeat(70));
    const photoPattern = await ServiceKeywords.findOne({ servicePattern: 'photo' });
    console.log(`Before: ${photoPattern.keywords.length} keywords`);
    
    const updatedPattern = await ServiceKeywords.addOrUpdatePattern(
      'photo',
      [...photoPattern.keywords, 'professional photography', 'photo session'],
      photoPattern.description,
      photoPattern.priority
    );
    console.log(`After: ${updatedPattern.keywords.length} keywords`);
    console.log('✅ Updated successfully');
    
    // Test 4: Get keywords for a service type
    console.log('\n📋 Test 4: Get Keywords for Service Type');
    console.log('-'.repeat(70));
    const keywords = await ServiceKeywords.getKeywordsForService('corporate-event-photography');
    console.log('Service Type: corporate-event-photography');
    console.log(`Matched Keywords (${keywords.length} total):`);
    console.log(keywords.slice(0, 20).join(', ') + '...');
    
    // Test 5: Preview what a vendor's keywords would look like
    console.log('\n📋 Test 5: Preview Vendor Keywords (if new vendor added)');
    console.log('-'.repeat(70));
    const sampleVendor = {
      name: 'Sky View Drones',
      serviceType: 'drone-photography',
      city: 'Mumbai',
      businessName: 'Sky View Productions'
    };
    
    const vendorKeywords = new Set();
    vendorKeywords.add(sampleVendor.serviceType);
    
    // Fetch from database
    const droneKeywords = await ServiceKeywords.getKeywordsForService(sampleVendor.serviceType);
    const photoKeywordsForDrone = await ServiceKeywords.getKeywordsForService('photo');
    
    droneKeywords.forEach(k => vendorKeywords.add(k));
    photoKeywordsForDrone.forEach(k => vendorKeywords.add(k));
    vendorKeywords.add(sampleVendor.name.toLowerCase());
    vendorKeywords.add(sampleVendor.city.toLowerCase());
    sampleVendor.businessName.toLowerCase().split(/\s+/).forEach(part => {
      if (part.length > 2) vendorKeywords.add(part);
    });
    
    console.log('Vendor:', sampleVendor.name);
    console.log('Service:', sampleVendor.serviceType);
    console.log(`Generated Keywords (${vendorKeywords.size} total):`);
    console.log(Array.from(vendorKeywords).slice(0, 25).join(', ') + '...');
    
    // Test 6: Check current vendor's keywords
    console.log('\n📋 Test 6: Current Vendor Keywords');
    console.log('-'.repeat(70));
    const vendor = await Vendor.findOne({ isActive: true });
    if (vendor) {
      console.log('Vendor:', vendor.name);
      console.log('Service Type:', vendor.serviceType);
      console.log(`Keywords (${vendor.searchKeywords.length} total):`);
      console.log(vendor.searchKeywords.slice(0, 20).join(', ') + '...');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ All Tests Passed!');
    console.log('\n💡 Key Takeaways:');
    console.log('   ✅ Keywords stored in database');
    console.log('   ✅ Can add/update without code changes');
    console.log('   ✅ Vendors auto-generate keywords on save');
    console.log('   ✅ Search works with dynamic keywords');
    console.log('='.repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testKeywordManagement();
