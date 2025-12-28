/**
 * Phase 1 Security Test Script
 * Tests the security implementation without requiring full test framework
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testPassword123';

let accessToken = null;
let refreshTokenCookie = null;

async function testLogin() {
  console.log('\n=== Testing Login Security ===');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      withCredentials: true,
      validateStatus: () => true // Don't throw on any status
    });

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      // Check response structure
      if (response.data.accessToken) {
        console.log('✅ accessToken returned');
        accessToken = response.data.accessToken;
      } else {
        console.log('❌ accessToken missing');
      }
      
      if (response.data.user) {
        console.log('✅ user object returned');
        if (response.data.user.password) {
          console.log('❌ CRITICAL: password in user object!');
        } else {
          console.log('✅ password NOT in user object');
        }
      } else {
        console.log('❌ user object missing');
      }
      
      // Check for password in response
      const responseStr = JSON.stringify(response.data);
      if (responseStr.includes(TEST_PASSWORD)) {
        console.log('❌ CRITICAL: password found in response!');
      } else {
        console.log('✅ password NOT in response');
      }
      
      // Check refresh token cookie
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
        if (refreshCookie) {
          console.log('✅ refreshToken cookie set');
          if (refreshCookie.includes('HttpOnly')) {
            console.log('✅ HttpOnly flag set');
          } else {
            console.log('❌ HttpOnly flag missing');
          }
          if (refreshCookie.includes('SameSite=Strict')) {
            console.log('✅ SameSite=Strict set');
          } else {
            console.log('⚠️  SameSite not Strict');
          }
          refreshTokenCookie = refreshCookie;
        } else {
          console.log('❌ refreshToken cookie missing');
        }
      }
    } else {
      console.log(`Response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function testRefreshToken() {
  console.log('\n=== Testing Refresh Token ===');
  
  if (!refreshTokenCookie) {
    console.log('⚠️  Skipping - no refresh token cookie');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
      headers: {
        'Cookie': refreshTokenCookie
      },
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      console.log('✅ Refresh token works');
      if (response.data.accessToken) {
        console.log('✅ New accessToken returned');
        accessToken = response.data.accessToken;
      }
    } else {
      console.log(`❌ Refresh failed: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function testRateLimiting() {
  console.log('\n=== Testing Rate Limiting ===');
  
  console.log('Sending 6 rapid login requests...');
  const requests = [];
  for (let i = 0; i < 6; i++) {
    requests.push(
      axios.post(`${BASE_URL}/auth/login`, {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }, {
        validateStatus: () => true
      })
    );
  }
  
  try {
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log('✅ Rate limiting is working');
    } else {
      console.log('⚠️  Rate limiting may not be active (no 429 responses)');
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function testProtectedRoute() {
  console.log('\n=== Testing Protected Route ===');
  
  if (!accessToken) {
    console.log('⚠️  Skipping - no access token');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      console.log('✅ Protected route accessible with token');
      if (response.data.password) {
        console.log('❌ CRITICAL: password in user response!');
      } else {
        console.log('✅ password NOT in user response');
      }
    } else {
      console.log(`❌ Protected route failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Phase 1 Security Tests');
  console.log(`Testing: ${BASE_URL}`);
  console.log('\nNote: Some tests require a valid user account');
  console.log('Create a test user first if needed:');
  console.log(`  POST ${BASE_URL}/auth/register`);
  console.log(`  { "name": "Test User", "email": "${TEST_EMAIL}", "password": "${TEST_PASSWORD}", "userType": "room_seeker" }`);
  
  await testLogin();
  await testRefreshToken();
  await testRateLimiting();
  await testProtectedRoute();
  
  console.log('\n=== Test Summary ===');
  console.log('Review the output above for any ❌ or ⚠️  warnings');
  console.log('\n✅ = Pass');
  console.log('❌ = Fail');
  console.log('⚠️  = Warning');
}

// Run tests
runTests().catch(console.error);

