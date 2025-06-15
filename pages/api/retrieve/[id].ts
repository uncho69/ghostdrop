import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, checkRateLimit } from '../../../lib/redis';

interface EncryptedDropData {
  encryptedData: string;
  iv: string;
  salt: string;
  version: string;
  createdAt: number;
  remainingViews: number;
  burnTimer?: number;
  failedAttempts?: number; // 🛡️ Track failed decryption attempts
}

// 🛡️ Security constants
const MAX_FAILED_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '300');
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Validate ID format
  if (!id || typeof id !== 'string' || id.length !== 32) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // 🛡️ Rate limiting per IP
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown';
  const rateLimitKey = `rate_limit:retrieve:${Array.isArray(clientIP) ? clientIP[0] : clientIP}`;
  
  try {
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many requests. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW
      });
    }

    const redis = await getRedisClient();
    const key = `drop:${id}`;

    // Get encrypted data from Redis
    const rawData = await redis.get(key);

    if (!rawData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Drop not found or expired' 
      });
    }

    // Parse encrypted drop data
    const dropData: EncryptedDropData = JSON.parse(rawData);

    // 🛡️ Check if drop has too many failed attempts
    if (dropData.failedAttempts && dropData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Auto-delete drop after too many failed attempts
      await redis.del(key);
      console.log(`🚨 Drop ${id} auto-deleted after ${MAX_FAILED_ATTEMPTS} failed attempts`);
      
      return res.status(410).json({ 
        success: false, 
        error: 'Drop has been permanently deleted due to security policy' 
      });
    }

    // Decrement remaining views
    dropData.remainingViews -= 1;

    // If no more views, delete immediately
    if (dropData.remainingViews <= 0) {
      await redis.del(key);
      console.log(`🗑️ Drop ${id} auto-deleted after final view`);
    } else {
      // Update with decremented views, preserve TTL
      const ttl = await redis.ttl(key);
      if (ttl > 0) {
        await redis.setEx(key, ttl, JSON.stringify(dropData));
      }
    }

    // Return encrypted data (client will decrypt)
    res.status(200).json({
      success: true,
      data: {
        encryptedData: dropData.encryptedData,
        iv: dropData.iv,
        salt: dropData.salt,
        version: dropData.version,
        ...(dropData.burnTimer && { burnTimer: dropData.burnTimer })
      }
    });

  } catch (error) {
    console.error('❌ Retrieve error:', error.message); // Only log error message
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 