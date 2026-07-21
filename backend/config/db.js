const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('MongoDB connection string not set (MONGODB_URI or MONGO_URI). Skipping initial connect.');
    return;
  }

  const maxAttempts = 6;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`MongoDB connect attempt ${attempt} to ${uri.split('@').pop().slice(0, 50)}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
      // exponential backoff (in seconds)
      const delaySeconds = Math.min(30, Math.pow(2, attempt));
      console.log(`Retrying in ${delaySeconds}s...`);
      await new Promise((res) => setTimeout(res, delaySeconds * 1000));
    }
  }

  const msg = `MongoDB connection failed after ${maxAttempts} attempts.`;
  console.error(msg);
  // Throw so the caller can decide whether to start the server. This prevents the app
  // from accepting requests that will immediately time out when mongoose isn't connected.
  throw new Error(msg);
};

module.exports = connectDB;