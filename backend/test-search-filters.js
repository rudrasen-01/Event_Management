/**
 * SEARCH FILTER TEST SCRIPT
 * 
 * This script tests various filter combinations to ensure
 * the search functionality works correctly
 * 
 * Run: node backend/test-search-filters.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test cases
const testCases = [
  {
    name: 'Test 1: Search by city only',
    payload: {
      location: {
        city: 'Mumbai'
      }
    }
  },
  {
    name: 'Test 2: Search by city and budget',
    payload: {
      location: {
        city: 'Delhi'
      },
      budget: {
        min: 50000,
        max: 100000
      }
    }
  },
  {
    name: 'Test 3: Search by service type',
    payload: {
      serviceId: 'photography'
    }
  },
  {
    name: 'Test 4: Search by service type and city',
    payload: {
      serviceId: 'catering',
      location: {
        city: 'Bangalore'
      }
    }
  },
  {
    name: 'Test 5: Search with text query',
    payload: {
      query: 'wedding photographer'
    }
  },
  {
    name: 'Test 6: Search with budget range only',
    payload: {
      budget: {
        min: 20000,
        max: 50000
      }
    }
  },
  {
    name: 'Test 7: Search verified vendors only',
    payload: {
      verified: true
    }
  },
  {
    name: 'Test 8: Search by minimum rating',
    payload: {
      rating: 4.0
    }
  },
  {
    name: 'Test 9: Complex search - all filters',
    payload: {
      query: 'photography',
      serviceId: 'photography',
      location: {
        city: 'Mumbai',
        area: 'Andheri'
      },
      budget: {
        min: 30000,
        max: 80000
      },
      verified: true,
      rating: 4.5
    }
  },
  {
    name: 'Test 10: Geospatial search',
    payload: {
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        radius: 5
      }
    }
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Starting Search Filter Tests...\n');
  console.log(`API URL: ${API_URL}/search\n`);
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n${testCase.name}`);
      console.log('-'.repeat(80));
      console.log('📤 Payload:', JSON.stringify(testCase.payload, null, 2));
      
      const startTime = Date.now();
      const response = await axios.post(`${API_URL}/search`, testCase.payload);
      const duration = Date.now() - startTime;
      
      if (response.data.success) {
        console.log(`✅ PASSED (${duration}ms)`);
        console.log(`   Results: ${response.data.data.results.length} vendors found`);
        console.log(`   Total: ${response.data.data.total}`);
        console.log(`   Page: ${response.data.data.page}/${response.data.data.totalPages}`);
        
        // Show first result if available
        if (response.data.data.results.length > 0) {
          const firstVendor = response.data.data.results[0];
          console.log(`   First result: ${firstVendor.name} (${firstVendor.city})`);
          console.log(`   Service: ${firstVendor.serviceType}`);
          console.log(`   Price: ₹${firstVendor.pricing?.min} - ₹${firstVendor.pricing?.max}`);
          console.log(`   Rating: ${firstVendor.rating}⭐ (${firstVendor.reviewCount} reviews)`);
        }
        
        passed++;
      } else {
        console.log('❌ FAILED - API returned success: false');
        console.log('   Error:', response.data.error);
        failed++;
      }
    } catch (error) {
      console.log('❌ FAILED - Request error');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Error:', error.response.data);
      } else {
        console.log('   Error:', error.message);
      }
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Summary:`);
  console.log(`   Total: ${testCases.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
