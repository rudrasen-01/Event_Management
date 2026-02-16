// Quick test of vendor profile endpoint
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testVendorProfile() {
  const vendorId = '698ed57ef9080fb827da62e6'; // Elite Venues Banquets
  const url = `http://localhost:5000/api/vendor-profile/${vendorId}`;
  
  console.log('Testing vendor profile endpoint...');
  console.log('URL:', url);
  console.log('');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    
    if (data.success) {
      console.log('\n✅ Profile loaded successfully!');
      console.log('Vendor:', data.data.vendor.businessName);
      console.log('Service:', data.data.vendor.serviceType);
      console.log('Location:', `${data.data.vendor.area}, ${data.data.vendor.city}`);
      console.log('Media count:', data.data.media?.length || 0);
      console.log('Reviews count:', data.data.reviews?.length || 0);
    } else {
      console.log('\n❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testVendorProfile();
