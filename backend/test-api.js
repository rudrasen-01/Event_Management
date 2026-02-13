const axios = require('axios');

const testVendorId = '69870663b48a63e77e5d41c4'; // event wold

async function testVendorProfileAPI() {
  try {
    console.log(`Testing API: GET /api/vendor-profile/${testVendorId}`);
    const response = await axios.get(`http://localhost:5000/api/vendor-profile/${testVendorId}`);
    console.log('\n✅ API Response Success!');
    console.log('Status:', response.status);
    console.log('Vendor:', response.data.data?.vendor?.businessName);
    console.log('Media count:', response.data.data?.media?.length || 0);
    console.log('Blogs count:', response.data.data?.blogs?.length || 0);
    console.log('\nFull Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ API Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data?.error);
    console.log('\nFull error response:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend server is not running! Please start it with: npm run dev');
    }
  }
}

testVendorProfileAPI();
