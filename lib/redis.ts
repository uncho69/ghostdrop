import { createClient } from 'redis';

// Configurazione Redis per Vercel Serverless
let redis: any = null;

export async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
      },
    });

    redis.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw new Error('Redis connection failed');
    }
  }

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