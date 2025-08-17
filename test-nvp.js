#!/usr/bin/env node

/**
 * PayPal NVP Express Checkout Test Script
 * 
 * This script tests the NVP integration endpoints to ensure they're working correctly.
 * Run this after setting up your .env file with NVP credentials.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNVPIntegration() {
  console.log('🧪 Testing PayPal NVP Express Checkout Integration\n');
  
  try {
    // Test 1: Check NVP configuration
    console.log('1️⃣ Testing NVP Configuration...');
    const configResponse = await axios.get(`${BASE_URL}/api/nvp/debug`);
    console.log('✅ Configuration Status:', configResponse.data.config);
    
    if (!configResponse.data.config.hasCredentials) {
      console.log('❌ NVP credentials are missing! Check your .env file.');
      console.log('Required: PAYPAL_USER, PAYPAL_PWD, PAYPAL_SIGNATURE');
      return;
    }
    
    // Test 2: Create Express Checkout session
    console.log('\n2️⃣ Testing Express Checkout Creation...');
    const createResponse = await axios.post(`${BASE_URL}/api/nvp/create`, {
      amount: '1.00',
      currency: 'USD'
    });
    
    console.log('✅ Express Checkout Created:', {
      token: createResponse.data.token,
      redirectUrl: createResponse.data.redirectUrl,
      success: createResponse.data.success
    });
    
    console.log('\n🎉 All tests passed! Your NVP integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Open your browser and go to the NVP Express Checkout page');
    console.log('2. Enter an amount and click "Pay with PayPal Express"');
    console.log('3. You should be redirected to PayPal Sandbox');
    console.log('4. Complete the payment with a sandbox account');
    console.log('5. Return to your success page');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
    
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure your server is running (npm start in server directory)');
    console.log('2. Check your .env file has the correct NVP credentials');
    console.log('3. Verify you\'re using NVP credentials, not v2 API credentials');
    console.log('4. Check the server logs for detailed error messages');
  }
}

// Check if axios is available
try {
  require.resolve('axios');
} catch (e) {
  console.error('❌ Axios is not installed. Please install it first:');
  console.error('npm install axios');
  process.exit(1);
}

// Run the test
testNVPIntegration();
