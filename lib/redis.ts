import { Redis } from '@upstash/redis'

// 🔒 SECURE REDIS CONFIGURATION - Upstash Redis Client
// 🚀 Configured for ghostdrop.org deployment
// 🔥 CACHE BUSTER: 2025-06-15T22:30:00Z - Complete rebuild with all fixes
// ✅ BUILD VERIFIED: Local build successful, ready for Vercel
let redisClient: Redis | null = null;

// 🛡️ Secure logging configuration
const ENABLE_REDIS_LOGS = process.env.ENABLE_REDIS_LOGS === 'true';

function secureLog(message: string, data?: any) {
  if (ENABLE_REDIS_LOGS) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  // Use environment variables for secure configuration
  const redisUrl = process.env.REDIS_URL;
  const redisPassword = process.env.REDIS_PASSWORD;
  
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  if (!redisPassword) {
    throw new Error('REDIS_PASSWORD environment variable is not set');
  }

  try {
    // Secure Upstash configuration with environment variables
    redisClient = new Redis({
      url: redisUrl,
      token: redisPassword,
    });

    secureLog('✅ Redis connected to ghostdrop.org');
    return redisClient;
  } catch (error) {
    secureLog('❌ Redis connection failed:', error);
    throw new Error(`Failed to connect to Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test connection function
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.ping();
    secureLog('✅ Redis ping successful');
    return true;
  } catch (error) {
    secureLog('❌ Redis ping failed:', error);
    return false;
  }
}

// 🔐 Cryptographically secure ID generation
export function generateSecureId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomArray = new Uint8Array(32);
  
  // Use crypto.getRandomValues for security
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomArray);
  } else {
    // Server-side secure random
    const crypto = require('crypto');
    crypto.randomFillSync(randomArray);
  }
  
  for (let i = 0; i < 32; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

// 🔑 Standardized Redis key
export function getDropKey(id: string): string {
  return `drop:${id}`;
}

// 🛡️ Rate limiting helper
export async function checkRateLimit(key: string, maxAttempts: number = 5, windowSeconds: number = 300): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const redis = getRedisClient();
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    const remaining = Math.max(0, maxAttempts - current);
    return {
      allowed: current <= maxAttempts,
      remaining
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open for rate limiting to avoid blocking legitimate users
    return { allowed: true, remaining: maxAttempts };
  }
}

export default redisClient; 