/**
 * Check actual vendor data in database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../models/VendorNew');
const connectDB = require('../config/db');

const checkVendorData = async () => {
  try {
    console.log('🔍 Checking vendor data in database...\n');
    
    await connectDB();
    
    const vendors = await Vendor.find({ isActive: true });
    
    console.log(`📊 Found ${vendors.length} active vendor(s)\n`);
    
    vendors.forEach((vendor, idx) => {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`VENDOR ${idx + 1}: ${vendor.name}`);
      console.log('='.repeat(70));
      console.log('📌 ID:', vendor._id);
      console.log('📌 Name:', vendor.name);
      console.log('📌 Business Name:', vendor.businessName || 'N/A');
      console.log('📌 Service Type:', vendor.serviceType);
      console.log('📌 City:', vendor.city);
      console.log('📌 Area:', vendor.area || 'N/A');
      console.log('📌 Contact Person:', vendor.contactPerson || 'N/A');
      console.log('📌 Budget:', `₹${vendor.pricing?.min} - ₹${vendor.pricing?.max}`);
      console.log('📌 Description:', vendor.description?.substring(0, 100) || 'N/A');
      console.log('\n🔑 Search Keywords:', vendor.searchKeywords || []);
      console.log('✅ Verified:', vendor.verified);
      console.log('⭐ Rating:', vendor.rating);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Check Complete!');
    console.log('='.repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkVendorData();
