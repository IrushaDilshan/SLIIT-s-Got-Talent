const mongoose = require('mongoose');

/**
 * MongoDB Database Connection Manager
 * Handles connection, error events, and connection pooling
 */

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-talent';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error(`   ${error.message}`);
    
    if (error.name === 'MongoNetworkError') {
      console.error('   Make sure MongoDB is running on localhost:27017');
      console.error('   Or update MONGO_URI in .env file');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
