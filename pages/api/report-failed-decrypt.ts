import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, checkRateLimit } from '../../lib/redis';

interface EncryptedDropData {
  encryptedData: string;
  iv: string;
  salt: string;
  version: string;
  createdAt: number;
  remainingViews: number;
  burnTimer?: number;
  failedAttempts?: number;
}

// 🛡️ Security constants
const MAX_FAILED_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 60; // 1 minute window for failed attempts
const RATE_LIMIT_MAX = 10; // Max 10 failed attempts per minute per IP

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  // Validate ID format
  if (!id || typeof id !== 'string' || id.length !== 32) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // 🛡️ Rate limiting per IP for failed attempts
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown';
  const rateLimitKey = `rate_limit:failed_decrypt:${Array.isArray(clientIP) ? clientIP[0] : clientIP}`;
  
  try {
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many failed attempts. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW
      });
    }

    const redis = await getRedisClient();
    const key = `drop:${id}`;

    // Get current drop data
    const rawData = await redis.get(key);

    if (!rawData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Drop not found or expired' 
      });
    }

    // Parse and update failed attempts
    const dropData: EncryptedDropData = JSON.parse(rawData);
    dropData.failedAttempts = (dropData.failedAttempts || 0) + 1;

    // 🚨 Auto-delete if too many failed attempts
    if (dropData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      await redis.del(key);
      console.log(`🚨 Drop ${id} auto-deleted after ${MAX_FAILED_ATTEMPTS} failed decryption attempts`);
      
      return res.status(200).json({ 
        success: true, 
        deleted: true,
        message: 'Drop permanently deleted due to security policy'
      });
    }

    // Update drop data with failed attempt count, preserve TTL
    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      await redis.setEx(key, ttl, JSON.stringify(dropData));
    }

    console.log(`⚠️ Failed decryption attempt ${dropData.failedAttempts}/${MAX_FAILED_ATTEMPTS} for drop ${id}`);

    res.status(200).json({ 
      success: true, 
      deleted: false,
      failedAttempts: dropData.failedAttempts,
      maxAttempts: MAX_FAILED_ATTEMPTS
    });

  } catch (error) {
    console.error('❌ Report failed decrypt error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 