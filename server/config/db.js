/**
 * MongoDB Database Connection Configuration
 * Uses Mongoose to connect to MongoDB Atlas or local MongoDB instance
 * Connection settings are loaded from environment variables
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options for reliable connections
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Retrying connection...');
    // Retry after 3 seconds
    setTimeout(() => connectDB(), 3000);
  }
};

module.exports = connectDB;
