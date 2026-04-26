const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/db');

async function seedUsers() {
  try {
    console.log('🌱 Seeding administrative and demo accounts...');

    const accounts = [
      {
        name: 'Admin User',
        email: 'anantyash21@gmail.com',
        password: 'Anant@123',
        role: 'admin',
        state: 'Maharashtra'
      },
      {
        name: 'Demo User',
        email: 'demo@hydrogrid.com',
        password: 'demo123',
        role: 'user',
        state: 'Delhi'
      },
      {
        name: 'System Admin',
        email: 'admin@hydrogrid.com',
        password: 'admin123',
        role: 'admin',
        state: 'Delhi'
      }
    ];

    for (const acc of accounts) {
      // Check if exists
      const existing = await query('SELECT id FROM users WHERE email = $1', [acc.email]);
      
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(acc.password, salt);

      if (existing.rows.length > 0) {
        console.log(`🔄 Updating existing account: ${acc.email}`);
        await query(
          'UPDATE users SET name = $1, password = $2, role = $3, state = $4 WHERE email = $5',
          [acc.name, hashed, acc.role, acc.state, acc.email]
        );
      } else {
        console.log(`✨ Creating new account: ${acc.email}`);
        await query(
          'INSERT INTO users (name, email, password, role, state) VALUES ($1, $2, $3, $4, $5)',
          [acc.name, acc.email, hashed, acc.role, acc.state]
        );
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit();
  }
}

seedUsers();
