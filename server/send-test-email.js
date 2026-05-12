const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sendAlertEmail } = require('./utils/emailService');

async function sendTestEmail() {
  try {
    const testUser = {
      name: 'Magical User',
      email: 'magicaldet@gmail.com',
      id: 'test-user-123'
    };

    const testAlert = {
      type: 'electricity',
      severity: 'red',
      message: '🚨 Your electricity usage (75 kWh) exceeds your limit of 50 kWh',
      threshold: 50,
      actualValue: 75,
      timestamp: new Date(),
    };

    console.log('📧 Sending test alert email to magicaldet@gmail.com...\n');
    const result = await sendAlertEmail(testUser, testAlert);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('   To:', result.recipient);
      console.log('   Message ID:', result.messageId);
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
  process.exit(0);
}

sendTestEmail();
