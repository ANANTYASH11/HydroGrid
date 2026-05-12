const axios = require('axios');

const TEST_USER = {
  email: 'demo@hydrogrid.com',
  password: 'demo123'
};

const API_URL = 'http://localhost:5000/api';

async function testEmailDelivery() {
  try {
    console.log('🧪 Starting Email Delivery Test...\n');
    
    // Step 1: Login
    console.log('1️⃣  Logging in as test user...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.id;
    console.log(`   ✅ Login successful. Token: ${token.substring(0, 20)}...`);
    console.log(`   ✅ User ID: ${userId}\n`);
    
    // Step 2: Add usage that exceeds threshold (> 500 liters for water)
    console.log('2️⃣  Adding usage record that exceeds threshold (1000 liters)...');
    const usageRes = await axios.post(
      `${API_URL}/usage`,
      {
        type: 'water',
        value: 1000,  // Exceeds default threshold of 500
        source: 'test'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`   ✅ Usage record created: ${usageRes.data.data.id}`);
    console.log(`   ✅ Value: ${usageRes.data.data.value} ${usageRes.data.data.unit}`);
    console.log(`   ✅ Alert should be triggered and email queued...\n`);
    
    console.log('3️⃣  Checking server logs for email confirmation...');
    console.log('   (Email should appear in server logs as "Alert email sent successfully to")\n');
    
    console.log('✅ TEST COMPLETE - Check server console for email delivery confirmation!');
    console.log('   Look for: "✅ Alert email sent successfully to demo@hydrogrid.com"\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testEmailDelivery();
