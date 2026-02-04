const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@aissignatureevent.com',
        password: 'admin123456'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.success && loginData.data.token) {
      const token = loginData.data.token;
      console.log('\n✅ Login successful!');
      console.log('Token:', token.substring(0, 20) + '...');

      // Test stats endpoint
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const statsData = await statsResponse.json();
      console.log('\n📊 Stats Response:', JSON.stringify(statsData, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminLogin();
