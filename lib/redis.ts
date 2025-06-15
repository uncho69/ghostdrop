import { createClient } from 'redis';

// 🔒 SECURE REDIS CONFIGURATION - No hardcoded credentials
// 🚀 FORCE DEPLOY: Fixed Upstash URL configuration
// 🔥 CACHE BUSTER: 2025-06-15T18:35:00Z - Force complete rebuild
let redis: any = null;

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

export async function getRedisClient() {
  secureLog('🔗 getRedisClient: Starting...');
  
  if (!redis) {
    secureLog('🆕 Creating new Redis client...');
    
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisUsername = process.env.REDIS_USERNAME || 'default';
    
    if (!redisUrl && !redisHost) {
      throw new Error('Redis configuration missing: REDIS_URL or REDIS_HOST required');
    }
    
    // 🔧 Upstash Redis configuration (secure)
    if (redisUrl && redisUrl.includes('upstash.io')) {
      secureLog('🔧 Using Upstash configuration with full URL...');
      
      redis = createClient({
        url: redisUrl,
        socket: {
          tls: true,
          rejectUnauthorized: false,
          connectTimeout: 10000,
        }
      });
    } 
    // 🏠 Local or custom Redis configuration
    else if (redisHost && redisPort && redisPassword) {
      secureLog('🏠 Using custom host/port configuration...');
      redis = createClient({
        socket: {
          host: redisHost,
          port: parseInt(redisPort),
          tls: redisHost.includes('upstash.io') || redisHost.includes('redis.cloud'),
          connectTimeout: 10000,
        },
        username: redisUsername,
        password: redisPassword
      });
    }
    // 📍 Fallback to URL configuration
    else {
      secureLog('📍 Using URL configuration...');
      redis = createClient({
        url: redisUrl || 'redis://localhost:6379',
        socket: {
          connectTimeout: 10000,
        },
      });
    }

    redis.on('error', (err: any) => {
      console.error('💥 Redis Client Error:', err.message); // Only log error message, not full details
    });

    redis.on('connect', () => {
      secureLog('✅ Redis connected');
    });
    
    redis.on('ready', () => {
      secureLog('🚀 Redis ready');
    });
    
    redis.on('end', () => {
      secureLog('🔚 Redis connection ended');
    });
  }

  if (!redis.isOpen) {
    try {
      secureLog('🔌 Connecting to Redis...');
      await redis.connect();
      secureLog('✅ Redis connection established');
    } catch (error) {
      console.error('💥 Redis connection failed:', error.message); // Only log error message
      throw new Error(`Redis connection failed: ${error.message}`);
    }
  }

  secureLog('🎯 Returning Redis client');
  return redis;
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
    const redis = await getRedisClient();
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
    // Fail open for rate limiting to avoid blocking legitimate users
    return { allowed: true, remaining: maxAttempts };
  }
}

export default redis; 