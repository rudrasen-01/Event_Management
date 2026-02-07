/**
 * Update Vendor Keywords (Database-Driven)
 * Regenerates searchKeywords for all vendors using ServiceKeywords from database
 * 
 * Usage: node scripts/update-vendor-keywords-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../models/VendorNew');
const ServiceKeywords = require('../models/ServiceKeywords');
const connectDB = require('../config/db');

const updateVendorKeywords = async () => {
  try {
    console.log('🔄 Updating vendor searchKeywords (database-driven)...\n');
    
    await connectDB();
    
    // Check if ServiceKeywords collection has data
    const keywordCount = await ServiceKeywords.countDocuments();
    if (keywordCount === 0) {
      console.log('⚠️  ServiceKeywords collection is empty!');
      console.log('   Run: node scripts/seed-service-keywords.js first');
      process.exit(1);
    }
    
    console.log(`📊 Found ${keywordCount} keyword patterns in database\n`);
    
    const vendors = await Vendor.find({ isActive: true });
    console.log(`📊 Found ${vendors.length} active vendors\n`);
    
    if (vendors.length === 0) {
      console.log('⚠️  No vendors found. Exiting...');
      process.exit(0);
    }
    
    let updated = 0;
    let skipped = 0;
    
    for (const vendor of vendors) {
      try {
        const keywords = new Set();
        
        // Add service type
        if (vendor.serviceType) {
          const serviceType = vendor.serviceType.toLowerCase();
          keywords.add(serviceType);
          
          // Fetch keywords from database
          const serviceKeywords = await ServiceKeywords.getKeywordsForService(serviceType);
          serviceKeywords.forEach(keyword => keywords.add(keyword.toLowerCase()));
        }
        
        // Add name variations
        if (vendor.name) {
          const nameParts = vendor.name.toLowerCase().split(/\s+/);
          nameParts.forEach(part => {
            if (part.length > 2) keywords.add(part);
          });
        }
        
        // Add business name variations
        if (vendor.businessName) {
          const businessParts = vendor.businessName.toLowerCase().split(/\s+/);
          businessParts.forEach(part => {
            if (part.length > 2) keywords.add(part);
          });
        }
        
        // Add city and area
        if (vendor.city) keywords.add(vendor.city.toLowerCase());
        if (vendor.area) keywords.add(vendor.area.toLowerCase());
        
        const newKeywords = Array.from(keywords);
        
        // Update vendor
        vendor.searchKeywords = newKeywords;
        await vendor.save();
        
        updated++;
        console.log(`✅ Updated: ${vendor.name} (${vendor.serviceType})`);
        console.log(`   Keywords (${newKeywords.length}): ${newKeywords.slice(0, 15).join(', ')}${newKeywords.length > 15 ? '...' : ''}`);
        
      } catch (error) {
        console.error(`❌ Error updating ${vendor.name}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Update Complete!');
    console.log(`   Updated: ${updated} vendors`);
    console.log(`   Skipped: ${skipped} vendors`);
    console.log('='.repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
};

updateVendorKeywords();
