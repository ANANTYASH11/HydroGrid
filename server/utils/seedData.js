/**
 * Seed Data Utility
 * Generates realistic sample data for the HydroGrid platform
 * Creates demo users, 6 months of usage data, and sample alerts
 * Run with: npm run seed (or node utils/seedData.js)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Usage = require('../models/Usage');
const Alert = require('../models/Alert');

// Demo user accounts
const demoUsers = [
  {
    name: 'Anant Yash',
    email: 'anant@hydrogrid.com',
    password: 'password123',
    role: 'admin',
    badges: [
      { name: 'Early Adopter', icon: '🌟', description: 'Joined HydroGrid in its first month' },
      { name: 'Water Saver', icon: '💧', description: 'Reduced water usage by 20%' },
      { name: 'Green Champion', icon: '🌿', description: 'Maintained low carbon footprint for 3 months' },
    ],
  },
  {
    name: 'Adarsh Verma',
    email: 'adarsh@hydrogrid.com',
    password: 'password123',
    role: 'user',
    badges: [
      { name: 'Energy Star', icon: '⚡', description: 'Top 10% most efficient electricity user' },
      { name: 'Eco Explorer', icon: '🌍', description: 'Explored all platform features' },
    ],
  },
  {
    name: 'Ashish Shankar',
    email: 'ashish@hydrogrid.com',
    password: 'password123',
    role: 'user',
    badges: [
      { name: 'Consistent Tracker', icon: '📊', description: 'Logged data for 30 consecutive days' },
      { name: 'Water Warrior', icon: '🏆', description: 'Saved 1000+ liters in a month' },
    ],
  },
  {
    name: 'Demo User',
    email: 'demo@hydrogrid.com',
    password: 'demo123',
    role: 'user',
    badges: [],
  },
  {
    name: 'Priya Sharma',
    email: 'priya@hydrogrid.com',
    password: 'password123',
    role: 'user',
    badges: [
      { name: 'Power Saver', icon: '⚡', description: 'Reduced electricity by 25%' },
    ],
  },
];

/**
 * Generate realistic water usage for a given date
 * Simulates household patterns: morning/evening peaks, weekend variation
 */
function generateWaterReadings(date, userId) {
  const readings = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const readingsCount = isWeekend ? 8 : 6; // More readings on weekends (home more)

  for (let i = 0; i < readingsCount; i++) {
    const hour = Math.floor(Math.random() * 24);
    const readingDate = new Date(date);
    readingDate.setHours(hour, Math.floor(Math.random() * 60));

    // Base usage with time-of-day variation
    let value = 15 + Math.random() * 35;
    if (hour >= 6 && hour <= 9) value *= 1.8;   // Morning shower/cooking
    if (hour >= 11 && hour <= 13) value *= 1.2;  // Lunch
    if (hour >= 18 && hour <= 21) value *= 1.6;  // Evening cooking/cleaning
    if (isWeekend) value *= 1.2;                  // Weekend bonus

    // Occasional spike (simulates leakage or heavy usage)
    if (Math.random() > 0.95) value *= 3;

    readings.push({
      userId,
      type: 'water',
      value: parseFloat(value.toFixed(1)),
      unit: 'liters',
      cost: parseFloat((value * 0.05).toFixed(2)),  // ₹0.05 per liter (Indian rate)
      source: 'iot',
      timestamp: readingDate,
    });
  }
  return readings;
}

/**
 * Generate realistic electricity usage for a given date
 * Hourly readings simulating smart meter data
 */
function generateElectricityReadings(date, userId) {
  const readings = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  // Generate hourly readings (like a smart meter)
  for (let hour = 0; hour < 24; hour++) {
    const readingDate = new Date(date);
    readingDate.setHours(hour, 0);

    // Base load varies by time of day
    let value;
    if (hour >= 0 && hour <= 5) {
      value = 0.3 + Math.random() * 0.4;      // Night: standby + fridge
    } else if (hour >= 6 && hour <= 8) {
      value = 1.5 + Math.random() * 2;        // Morning: heating/AC, cooking
    } else if (hour >= 9 && hour <= 11) {
      value = 0.8 + Math.random() * 1.2;      // Mid-morning
    } else if (hour >= 12 && hour <= 14) {
      value = 1.2 + Math.random() * 1.5;      // Lunch peak
    } else if (hour >= 15 && hour <= 17) {
      value = 0.6 + Math.random() * 1;        // Afternoon
    } else if (hour >= 18 && hour <= 22) {
      value = 2 + Math.random() * 3;          // Evening peak: AC, TV, cooking
    } else {
      value = 0.5 + Math.random() * 0.8;      // Late night
    }

    if (isWeekend) value *= 1.15; // Slightly higher on weekends

    // Random spike (simulates AC burst or high-power appliance)
    if (Math.random() > 0.97) value *= 2.5;

    readings.push({
      userId,
      type: 'electricity',
      value: parseFloat(value.toFixed(2)),
      unit: 'kWh',
      cost: parseFloat((value * 8).toFixed(2)),  // ₹8 per kWh (Indian rate)
      source: 'iot',
      timestamp: readingDate,
    });
  }
  return readings;
}

/**
 * Main seed function
 * Clears existing data and populates with fresh demo data
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Usage.deleteMany({});
    await Alert.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const createdUsers = await User.create(demoUsers);
    console.log(`👥 Created ${createdUsers.length} demo users`);

    // Generate 6 months of usage data for each user
    const now = new Date();
    let totalReadings = 0;

    for (const user of createdUsers) {
      const allReadings = [];

      // Generate data for the past 180 days
      for (let day = 0; day < 180; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(0, 0, 0, 0);

        // Add water and electricity readings for this day
        allReadings.push(...generateWaterReadings(date, user._id));
        allReadings.push(...generateElectricityReadings(date, user._id));
      }

      // Bulk insert all readings for this user
      await Usage.insertMany(allReadings);
      totalReadings += allReadings.length;
      console.log(`📊 Generated ${allReadings.length} readings for ${user.name}`);
    }

    // Create sample alerts
    const sampleAlerts = [
      {
        userId: createdUsers[0]._id,
        type: 'electricity',
        severity: 'red',
        message: '🚨 Critical: Electricity usage spike detected! 85 kWh recorded (70% above threshold)',
        threshold: 50,
        actualValue: 85,
        read: false,
      },
      {
        userId: createdUsers[0]._id,
        type: 'water',
        severity: 'yellow',
        message: '⚠️ Warning: Water usage (580L) is approaching your daily limit of 500L',
        threshold: 500,
        actualValue: 580,
        read: false,
      },
      {
        userId: createdUsers[0]._id,
        type: 'water',
        severity: 'red',
        message: '🚨 Possible leak detected! Unusual water consumption pattern at 3 AM',
        threshold: 500,
        actualValue: 750,
        read: true,
      },
      {
        userId: createdUsers[0]._id,
        type: 'system',
        severity: 'green',
        message: '✅ Great job! Your electricity usage was 15% below average this week',
        read: false,
      },
      {
        userId: createdUsers[0]._id,
        type: 'electricity',
        severity: 'yellow',
        message: '⚠️ Peak hour alert: High electricity usage detected between 6-9 PM',
        threshold: 50,
        actualValue: 62,
        read: false,
      },
    ];

    await Alert.create(sampleAlerts);
    console.log(`🚨 Created ${sampleAlerts.length} sample alerts`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`   Total users: ${createdUsers.length}`);
    console.log(`   Total readings: ${totalReadings}`);
    console.log(`   Total alerts: ${sampleAlerts.length}`);
    console.log('\n📧 Demo login credentials:');
    console.log('   Admin: anant@hydrogrid.com / password123');
    console.log('   User:  demo@hydrogrid.com / demo123');
    console.log('\n🇮🇳 Configured for Indian locale (₹ INR, IST timezone)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
