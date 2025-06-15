import { createClient } from 'redis';

// Configurazione Redis sicura
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
  },
});

// Gestione errori Redis
redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('disconnect', () => {
  console.log('❌ Redis disconnected');
});

// Connessione lazy
let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    try {
      await redis.connect();
      isConnected = true;
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