import mongoose from 'mongoose';
import { keys } from './key.js'; // Import MongoDB URI from keys.js

const connectDB = async () => {
  try {
    await mongoose.connect(keys.mongoURI );
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
