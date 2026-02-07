/**
 * Test frontend API call to search endpoint
 * Simulates what the frontend sends
 */

require('dotenv').config();
const axios = require('axios');

const testFrontendSearch = async () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
  
  console.log('🧪 Testing Frontend-Style Search API Calls\n');
  console.log('API Base URL:', BASE_URL);
  console.log('='.repeat(70));
  
  const testCases = [
    {
      name: 'Search for "photography"',
      payload: {
        query: 'photography',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    },
    {
      name: 'Search for "photo"',
      payload: {
        query: 'photo',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    },
    {
      name: 'Search for "p" (single letter)',
      payload: {
        query: 'p',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    },
    {
      name: 'Search for "camera"',
      payload: {
        query: 'camera',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    },
    {
      name: 'Search for "Corporate Event Photography"',
      payload: {
        query: 'Corporate Event Photography',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    },
    {
      name: 'Search for "rohit"',
      payload: {
        query: 'rohit',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    },
    {
      name: 'Search for "indore"',
      payload: {
        query: 'indore',
        page: 1,
        limit: 30,
        sort: 'relevance'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('-'.repeat(70));
    console.log('Payload:', JSON.stringify(testCase.payload, null, 2));
    
    try {
      const response = await axios.post(`${BASE_URL}/search`, testCase.payload);
      
      if (response.data.success) {
        const { total, results } = response.data.data;
        console.log(`✅ Success: Found ${total} vendor(s)`);
        
        if (results && results.length > 0) {
          results.forEach((vendor, idx) => {
            console.log(`   ${idx + 1}. ${vendor.name} - ${vendor.serviceType} (${vendor.city})`);
          });
        } else {
          console.log('   ⚠️  No results returned');
        }
      } else {
        console.log('❌ API returned success: false');
      }
      
    } catch (error) {
      if (error.response) {
        console.log('❌ API Error:', error.response.status, error.response.statusText);
        console.log('   Error data:', error.response.data);
      } else if (error.request) {
        console.log('❌ No response from server. Is backend running on', BASE_URL, '?');
      } else {
        console.log('❌ Error:', error.message);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Frontend API Test Complete!');
  console.log('='.repeat(70));
};

testFrontendSearch();
