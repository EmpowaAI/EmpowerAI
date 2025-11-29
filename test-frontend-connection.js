/**
 * Test script to verify frontend-backend connection
 */

const axios = require('axios');

const FRONTEND_URL = 'https://empower-ai-gamma.vercel.app';
const BACKEND_URL = 'https://empowerai.onrender.com';

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection\n');
  
  // Test 1: Backend Health
  console.log('1. Testing Backend Health...');
  try {
    const backendHealth = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Backend is running:', backendHealth.data);
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    return;
  }
  
  // Test 2: Frontend Accessibility
  console.log('\n2. Testing Frontend Accessibility...');
  try {
    const frontendResponse = await axios.get(FRONTEND_URL, { 
      timeout: 10000,
      validateStatus: () => true 
    });
    console.log('✅ Frontend is accessible:', frontendResponse.status);
  } catch (error) {
    console.log('❌ Frontend not accessible:', error.message);
  }
  
  // Test 3: Check if VITE_API_URL is configured
  console.log('\n3. Checking Frontend Configuration...');
  console.log('⚠️  To verify VITE_API_URL is set:');
  console.log('   - Open browser console on frontend');
  console.log('   - Check Network tab when making API calls');
  console.log('   - Should see requests to:', `${BACKEND_URL}/api`);
  console.log('   - NOT requests to: http://localhost:5000/api');
  
  // Test 4: Test Registration Endpoint
  console.log('\n4. Testing Registration Endpoint...');
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123!'
    };
    
    const registerResponse = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      testUser,
      { validateStatus: () => true }
    );
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration endpoint works!');
    } else {
      console.log('⚠️  Registration response:', registerResponse.status, registerResponse.data);
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.response?.data || error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('   Backend URL:', BACKEND_URL);
  console.log('   Frontend URL:', FRONTEND_URL);
  console.log('\n💡 If frontend shows "localhost:5000" errors:');
  console.log('   → Set VITE_API_URL in Vercel to:', `${BACKEND_URL}/api`);
  console.log('   → Then redeploy the frontend');
}

testConnection().catch(console.error);

