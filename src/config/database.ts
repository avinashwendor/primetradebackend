import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

/**
 * Global connection cache for serverless environments.
 * This prevents creating new connections on every function invocation.
 */
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = { conn: null, promise: null };

// Ensure cache persists across hot reloads in development
if (process.env.NODE_ENV === 'development') {
  const globalWithMongoose = global as typeof globalThis & {
    mongoose: typeof cached;
  };
  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
  }
  cached = globalWithMongoose.mongoose;
}

/**
 * MongoDB connection options optimized for serverless environments.
 * - Reduced pool sizes to minimize connection overhead
 * - bufferCommands: false for fail-fast behavior
 * - Reasonable timeouts that balance cold start vs reliability
 */
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 5,              // Reduced for serverless
  minPoolSize: 0,              // Allow connections to be released
  serverSelectionTimeoutMS: 10000,  // Allow time for cold start
  socketTimeoutMS: 20000,      // Reduced from 45s
  connectTimeoutMS: 10000,     // Explicit connect timeout
  bufferCommands: false,       // Fail fast instead of buffering
};

export async function connectDatabase(): Promise<typeof mongoose> {
  // If already connected, return cached connection
  if (cached.conn) {
    const readyState = cached.conn.connection.readyState;
    if (readyState === 1) { // Connected
      logger.debug('Using cached MongoDB connection');
      return cached.conn;
    }
    // Connection is not ready, reset cache
    cached.conn = null;
    cached.promise = null;
  }

  // If connection is in progress, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  // Create new connection
  try {
    logger.info('Establishing new MongoDB connection...');

    cached.promise = mongoose.connect(config.db.uri, mongooseOptions);
    cached.conn = await cached.promise;

    logger.info('MongoDB connection established successfully');

    // Set up connection event handlers (only once)
    if (mongoose.connection.listenerCount('error') === 0) {
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', { error: error.message });
        // Reset cache on error to force reconnection
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        cached.conn = null;
        cached.promise = null;
      });
    }

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}
