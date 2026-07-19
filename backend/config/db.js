const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Accept either MONGODB_URI (commonly used) or MONGO_URI for compatibility
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;