import mongoose from 'mongoose';

let connected = false;
let connecting = false;
let connectionPromise = null;

const connectDB = async () => {
  // Skip connection entirely if URI is not configured (e.g. at build time on Vercel)
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not set — skipping DB connection');
    return;
  }

  mongoose.set('strictQuery', true);

  if (connected) {
    return;
  }

  if (connecting) {
    return connectionPromise;
  }

  connecting = true;

  connectionPromise = (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      connected = true;
      connecting = false;
      console.log('MongoDB connected...');
    } catch (error) {
      connecting = false;
      console.log('MongoDB connection failed (runtime):', error.message);
      // Don't throw — let the page handle the missing DB gracefully
    }
  })();

  return connectionPromise;
};

export default connectDB;
