/**
 * Supabase PostgreSQL Connection
 * Using 'pg' pool for efficient connection management
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Supabase PostgreSQL Connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
  query: (text, params) => pool.query(text, params),
};
