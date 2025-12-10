import mongoose from 'mongoose';
import { env } from './env';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose with connection pooling
 * Uses global cache to prevent multiple connections in development
 * @returns Promise resolving to mongoose connection
 * @throws Error if connection fails
 */
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    
    if (error instanceof Error) {
      if (error.message.includes('whitelist')) {
        throw new Error(
          'MongoDB Atlas Connection Error: Your IP address is not whitelisted.\n' +
          'Please go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (for development)\n' +
          'Or add your current IP address: https://www.mongodb.com/docs/atlas/security-whitelist/'
        );
      }
    }
    
    throw error;
  }

  return cached.conn;
}

export default connectDB;

