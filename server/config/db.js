/**
 * Supabase PostgreSQL Connection
 * Using 'pg' pool for efficient connection management
 */

const { Pool } = require('pg');

// Parse DATABASE_URL if available
let poolConfig = {
  ssl: {
    rejectUnauthorized: false
  }
};

if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  poolConfig.user = dbUrl.username;
  poolConfig.password = decodeURIComponent(dbUrl.password);
  poolConfig.host = dbUrl.hostname;
  poolConfig.port = dbUrl.port || 5432;
  poolConfig.database = dbUrl.pathname.split('/')[1];
} else {
  poolConfig.connectionString = process.env.DATABASE_URL;
}

const pool = new Pool(poolConfig);

const connectDB = async () => {
  try {
    // Sanitize URL for logging (strip password)
    const sanitizedUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED';
    console.log(`📡 Attempting to connect to: ${sanitizedUrl}`);
    
    const client = await pool.connect();
    console.log('✅ Supabase PostgreSQL Connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Supabase Connection Error Details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Full Error:', err);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
  query: (text, params) => pool.query(text, params),
};
