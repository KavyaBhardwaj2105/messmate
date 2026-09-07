const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/messmate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️  MongoDB disconnected.');
    });

    return conn;
  } catch (error) {
    isConnected = false;

    if (isProduction) {
      // In production there is no safe fallback: the JSON file store is a
      // demo/dev convenience only and is not safe for concurrent, durable,
      // multi-instance production use.
      console.error(`❌ Could not connect to MongoDB in production: ${error.message}`);
      console.error('Refusing to silently fall back to the local JSON file store in production.');
      process.exit(1);
    }

    console.warn(`⚡ Notice: MongoDB not reachable (${error.message}).`);
    console.warn('🚀 Falling back to the local JSON file store for development/demo purposes only.');
    return null;
  }
};

const isMongoDB = () => isConnected;

module.exports = { connectDB, isMongoDB };
