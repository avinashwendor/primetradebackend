import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  nodeEnv: string;
  port: number;
  db: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  bcryptRounds: number;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const stringValue = process.env[key];
  if (stringValue === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const parsed = parseInt(stringValue, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

export const config: EnvConfig = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3001),
  db: {
    uri: getEnvVar('MONGODB_URI', 'mongodb+srv://peraboinaudaykiran:peraboinaudaykiran@db.v35kmt6.mongodb.net/?appName=DB'),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '15m'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 10),
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
