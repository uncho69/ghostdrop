import { Redis } from '@upstash/redis'

// 🔒 SECURE REDIS CONFIGURATION - Upstash Redis Client
// 🚀 FORCE DEPLOY: Complete rewrite for Upstash v3
// 🔥 CACHE BUSTER: 2025-06-15T20:00:00Z - Force complete rebuild
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

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  try {
    // Parse the Redis URL: redis://default:password@host:port
    const url = new URL(redisUrl);
    const password = url.password;
    const hostname = url.hostname;
    const port = url.port || '6379';

    if (!password) {
      throw new Error('Password not found in REDIS_URL');
    }

    if (!hostname) {
      throw new Error('Hostname not found in REDIS_URL');
    }

    // For Upstash, we need HTTPS URL and the password as token
    const upstashUrl = `https://${hostname}:${port}`;
    
    secureLog('🔌 Configuring Upstash Redis client', {
      url: upstashUrl,
      hasToken: !!password,
      hostname,
      port
    });

    redisClient = new Redis({
      url: upstashUrl,
      token: password
    });

    secureLog('✅ Upstash Redis client configured successfully');
    return redisClient;

  } catch (error) {
    console.error('❌ Redis configuration error:', error);
    throw new Error(`Failed to configure Redis: ${error.message}`);
  }
}

export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    console.log('✅ Redis connected');
    return true;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
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