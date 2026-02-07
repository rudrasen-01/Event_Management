/**
 * Seed Service Keywords Database
 * Loads keywords from JSON file and populates database
 * 
 * Usage: node scripts/seed-service-keywords.js
 * 
 * To add/update keywords:
 * 1. Edit data/service-keywords.json
 * 2. Run this script
 * 3. Run: node scripts/update-vendor-keywords-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ServiceKeywords = require('../models/ServiceKeywords');
const connectDB = require('../config/db');

const seedKeywords = async () => {
  try {
    console.log('🌱 Seeding Service Keywords from JSON...\n');
    
    await connectDB();
    
    // Load keywords from JSON file
    const jsonPath = path.join(__dirname, '../data/service-keywords.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Keywords JSON file not found at:', jsonPath);
      console.log('   Create it with keyword mappings');
      process.exit(1);
    }
    
    const keywordMappings = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📄 Loaded ${keywordMappings.length} patterns from JSON\n`);
    
    // Clear existing keywords (optional - remove if you want to preserve existing)
    const existingCount = await ServiceKeywords.countDocuments();
    console.log(`📊 Found ${existingCount} existing keyword patterns\n`);
    
    let added = 0;
    let updated = 0;
    
    for (const mapping of keywordMappings) {
      const existing = await ServiceKeywords.findOne({ 
        servicePattern: mapping.servicePattern 
      });
      
      const result = await ServiceKeywords.addOrUpdatePattern(
        mapping.servicePattern,
        mapping.keywords,
        mapping.description,
        mapping.priority
      );
      
      if (existing) {
        updated++;
        console.log(`✅ Updated: ${mapping.servicePattern} (${mapping.keywords.length} keywords)`);
      } else {
        added++;
        console.log(`➕ Added: ${mapping.servicePattern} (${mapping.keywords.length} keywords)`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Seeding Complete!');
    console.log(`   Added: ${added} patterns`);
    console.log(`   Updated: ${updated} patterns`);
    console.log(`   Total: ${added + updated} patterns in database`);
    console.log('='.repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedKeywords();
