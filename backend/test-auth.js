/**
 * AUTH TEST SCRIPT
 * Tests user registration and login
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication...\n');
  console.log(`API URL: ${API_URL}\n`);
  console.log('='.repeat(80));

  // Test 1: Register new user
  console.log('\n📝 Test 1: User Registration');
  console.log('-'.repeat(80));
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'test123456',
    phone: '9876543210'
  };

  try {
    console.log('📤 Payload:', JSON.stringify(testUser, null, 2));
    
    const registerResponse = await axios.post(`${API_URL}/users/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('   User:', registerResponse.data.data.user.name);
    console.log('   Email:', registerResponse.data.data.user.email);
    console.log('   Role:', registerResponse.data.data.user.role);
    console.log('   Token:', registerResponse.data.data.token.substring(0, 20) + '...');
    
    // Test 2: Login with same credentials
    console.log('\n🔐 Test 2: User Login');
    console.log('-'.repeat(80));
    
    const loginPayload = {
      email: testUser.email,
      password: testUser.password
    };
    
    console.log('📤 Payload:', JSON.stringify(loginPayload, null, 2));
    
    const loginResponse = await axios.post(`${API_URL}/users/login`, loginPayload);
    
    console.log('✅ Login successful!');
    console.log('   User:', loginResponse.data.data.user.name);
    console.log('   Email:', loginResponse.data.data.user.email);
    console.log('   Role:', loginResponse.data.data.user.role);
    console.log('   Token:', loginResponse.data.data.token.substring(0, 20) + '...');
    console.log('   Redirect:', loginResponse.data.data.redirectTo);
    
    // Test 3: Get profile with token
    console.log('\n👤 Test 3: Get User Profile');
    console.log('-'.repeat(80));
    
    const profileResponse = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.token}`
      }
    });
    
    console.log('✅ Profile fetched successfully!');
    console.log('   Name:', profileResponse.data.data.name);
    console.log('   Email:', profileResponse.data.data.email);
    console.log('   Role:', profileResponse.data.data.role);
    console.log('   Created:', new Date(profileResponse.data.data.createdAt).toLocaleString());
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ All authentication tests passed!\n');
    
  } catch (error) {
    console.log('\n❌ Test failed!');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    console.log('\n');
    process.exit(1);
  }
}

// Test 4: Test with invalid credentials
async function testInvalidLogin() {
  console.log('\n🔒 Test 4: Invalid Login (should fail)');
  console.log('-'.repeat(80));
  
  try {
    await axios.post(`${API_URL}/users/login`, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    
    console.log('❌ Test failed - should have thrown error');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected invalid credentials');
      console.log('   Error:', error.response.data.error.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Test 5: Test duplicate registration
async function testDuplicateRegistration() {
  console.log('\n📝 Test 5: Duplicate Registration (should fail)');
  console.log('-'.repeat(80));
  
  const email = 'duplicate@example.com';
  
  try {
    // First registration
    await axios.post(`${API_URL}/users/register`, {
      name: 'First User',
      email: email,
      password: 'password123'
    });
    
    // Try to register again with same email
    await axios.post(`${API_URL}/users/register`, {
      name: 'Second User',
      email: email,
      password: 'password456'
    });
    
    console.log('❌ Test failed - should have thrown error');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly rejected duplicate email');
      console.log('   Error:', error.response.data.error.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Run all tests
(async () => {
  try {
    await testAuth();
    await testInvalidLogin();
    await testDuplicateRegistration();
    
    console.log('\n' + '='.repeat(80));
    console.log('\n🎉 All tests completed!\n');
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
})();
