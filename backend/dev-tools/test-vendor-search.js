/**
 * Test Vendor Search Functionality
 * 
 * Tests the enhanced real-time vendor search with multi-field matching
 * 
 * Usage: node dev-tools/test-vendor-search.js
 */

require('dotenv').config();
const Vendor = require('../models/VendorNew');
const connectDB = require('../config/db');

const testSearchQueries = async () => {
  try {
    console.log('🧪 Testing Enhanced Vendor Search\n');
    console.log('='.repeat(70));
    
    // Connect to database
    await connectDB();
    
    // Test queries
    const testQueries = [
      { query: 'photo', description: 'Search for "photo" (should match photography vendors)' },
      { query: 'photographer', description: 'Search for "photographer"' },
      { query: 'rohit', description: 'Search by vendor name "rohit"' },
      { query: 'corporate', description: 'Search for "corporate"' },
      { query: 'indore', description: 'Search by city "indore"' },
      { query: 'event', description: 'Search for "event"' }
    ];
    
    for (const test of testQueries) {
      console.log(`\n📋 ${test.description}`);
      console.log('-'.repeat(70));
      
      const searchParams = {
        query: test.query,
        page: 1,
        limit: 10,
        sort: 'relevance'
      };
      
      const results = await Vendor.comprehensiveSearch(searchParams);
      
      console.log(`✅ Found ${results.total} vendor(s)`);
      
      if (results.results.length > 0) {
        results.results.forEach((vendor, index) => {
          console.log(`\n   ${index + 1}. ${vendor.name}`);
          console.log(`      Service: ${vendor.serviceType}`);
          console.log(`      Location: ${vendor.city}${vendor.area ? ', ' + vendor.area : ''}`);
          console.log(`      Budget: ₹${vendor.pricing.min.toLocaleString('en-IN')} - ₹${vendor.pricing.max.toLocaleString('en-IN')}`);
          console.log(`      Keywords: ${vendor.searchKeywords?.slice(0, 8).join(', ')}...`);
          if (vendor.score) {
            console.log(`      Relevance Score: ${vendor.score.toFixed(2)}`);
          }
        });
      } else {
        console.log('   ⚠️  No vendors found');
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Search Testing Complete!');
    console.log('='.repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testSearchQueries();
