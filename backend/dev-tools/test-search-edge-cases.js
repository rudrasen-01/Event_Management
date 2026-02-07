/**
 * Additional search test cases
 */

require('dotenv').config();
const axios = require('axios');

const testEdgeCases = async () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
  
  console.log('🧪 Testing Edge Cases\n');
  console.log('='.repeat(70));
  
  const tests = [
    { query: 'event', desc: 'Partial word "event" in "corporate-event-photography"' },
    { query: 'corporate', desc: 'Partial word "corporate"' },
    { query: 'shoot', desc: 'Photography keyword "shoot"' },
    { query: 'portrait', desc: 'Photography keyword "portrait"' },
    { query: 'wed', desc: 'Partial match "wed" for "wedding"' },
    { query: 'ph', desc: 'Very short partial "ph"' },
    { query: 'PHOTOGRAPHY', desc: 'All caps "PHOTOGRAPHY"' },
    { query: 'PhOtO', desc: 'Mixed case "PhOtO"' },
    { query: 'event photographer', desc: 'Multi-word with space' },
  ];
  
  for (const test of tests) {
    console.log(`\n📋 ${test.desc}`);
    console.log('   Query: "' + test.query + '"');
    console.log('-'.repeat(70));
    
    try {
      const response = await axios.post(`${BASE_URL}/search`, {
        query: test.query,
        page: 1,
        limit: 10,
        sort: 'relevance'
      });
      
      if (response.data.success && response.data.data.total > 0) {
        console.log(`   ✅ Found ${response.data.data.total} vendor(s)`);
      } else {
        console.log(`   ❌ No vendors found`);
      }
      
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Edge Case Testing Complete!');
  console.log('='.repeat(70));
};

testEdgeCases();
