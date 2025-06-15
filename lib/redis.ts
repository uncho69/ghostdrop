import { createClient } from 'redis';

// Configurazione Redis per Vercel Serverless con TLS
let redis: any = null;

export async function getRedisClient() {
  console.log('🔗 getRedisClient: Starting...');
  
  if (!redis) {
    console.log('🆕 Creating new Redis client...');
    console.log('📍 Redis URL:', process.env.REDIS_URL ? 'SET' : 'MISSING');
    
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Configurazione per Upstash Redis con credenziali separate
    if (redisUrl.includes('upstash.io')) {
      console.log('🔧 Using Upstash configuration...');
      redis = createClient({
        socket: {
          host: 'beloved-boa-34450.upstash.io',
          port: 6379,
          tls: true,
          rejectUnauthorized: false
        },
        username: 'default',
        password: 'AYaSAAIjcDFhMDgzZDgwYWJiMjk0ODIzOGQyY2YwYTQ3NmM5ZDQ1NHAxMA'
      });
    } else {
      // Configurazione locale
      redis = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
        },
      });
    }

    redis.on('error', (err: any) => {
      console.error('💥 Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
    
    redis.on('ready', () => {
      console.log('🚀 Redis ready');
    });
    
    redis.on('end', () => {
      console.log('🔚 Redis connection ended');
    });
  }

  if (!redis.isOpen) {
    try {
      console.log('🔌 Connecting to Redis...');
      await redis.connect();
      console.log('✅ Redis connection established');
    } catch (error) {
      console.error('💥 DETAILED Redis connection error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        redisUrl: process.env.REDIS_URL ? 'SET' : 'MISSING'
      });
      throw new Error(`Redis connection failed: ${error.message}`);
    }
  }

  console.log('🎯 Returning Redis client');
  return redis;
}

// Utility per generare UUID sicuri
export function generateSecureId(): string {
  // Genera un ID sicuro usando crypto random
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomArray = new Uint8Array(32);
  
  // Usa crypto.getRandomValues per sicurezza
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomArray);
  } else {
    // Server-side fallback
    const crypto = require('crypto');
    crypto.randomFillSync(randomArray);
  }
  
  for (let i = 0; i < 32; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

// Chiave Redis standardizzata
export function getDropKey(id: string): string {
  return `drop:${id}`;
}

export default redis; 