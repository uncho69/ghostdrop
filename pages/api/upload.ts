import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, checkRateLimit } from '../../lib/redis';

// Configuration for large file handling
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
};

interface UploadRequest {
  encryptedData: string;
  iv: string;
  salt: string;
  version: string;
  burnTimer?: number; // 🔥 Burn timer in seconds
}

interface EncryptedDropData {
  encryptedData: string;
  iv: string;
  salt: string;
  version: string;
  createdAt: number;
  remainingViews: number;
  burnTimer?: number; // 🔥 Burn timer in seconds
  failedAttempts?: number; // 🛡️ Track failed attempts
}

// 🛡️ Security constants
const RATE_LIMIT_WINDOW = 60; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 uploads per minute per IP
const MAX_BURN_TIMER = 300; // Max 5 minutes burn timer
const DEFAULT_TTL = 86400; // 24 hours default

// Generate secure random ID (32 chars)
function generateSecureId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomArray = new Uint8Array(32);
  
  // Use crypto for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomArray);
  } else {
    // Server-side fallback
    const nodeCrypto = require('crypto');
    nodeCrypto.randomFillSync(randomArray);
  }
  
  for (let i = 0; i < 32; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🛡️ Rate limiting per IP
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown';
  const rateLimitKey = `rate_limit:upload:${Array.isArray(clientIP) ? clientIP[0] : clientIP}`;
  
  try {
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Too many uploads. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW
      });
    }

    // Parse and validate input
    const { encryptedData, iv, salt, version, burnTimer }: UploadRequest = req.body;

    // Strict validation
    if (!encryptedData || !iv || !salt || !version) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { encryptedData: !!encryptedData, iv: !!iv, salt: !!salt, version: !!version }
      });
    }

    if (typeof encryptedData !== 'string' || encryptedData.length === 0) {
      return res.status(400).json({ error: 'Invalid encrypted data' });
    }

    if (typeof iv !== 'string' || iv.length === 0) {
      return res.status(400).json({ error: 'Invalid IV' });
    }

    if (typeof salt !== 'string' || salt.length === 0) {
      return res.status(400).json({ error: 'Invalid salt' });
    }

    if (typeof version !== 'string' || version.length === 0) {
      return res.status(400).json({ error: 'Invalid version' });
    }

    // 🔥 Validate burn timer if provided
    if (burnTimer !== undefined && burnTimer !== null && (typeof burnTimer !== 'number' || burnTimer < 0 || burnTimer > MAX_BURN_TIMER)) {
      return res.status(400).json({ error: `Invalid burn timer (must be 0-${MAX_BURN_TIMER} seconds)` });
    }

    // Data size limit (25MB in base64)
    const totalSize = encryptedData.length + iv.length + salt.length;
    if (totalSize > 33554432) { // ~25MB in base64
      return res.status(413).json({ error: 'Data too large (max 25MB)' });
    }

    // Generate secure ID
    const id = generateSecureId();
    const key = `drop:${id}`;

    // Prepare data for Redis
    const dropData: EncryptedDropData = {
      encryptedData,
      iv,
      salt,
      version,
      remainingViews: 1, // Self-destruct after 1 view
      createdAt: Date.now(),
      failedAttempts: 0, // Initialize failed attempts counter
      ...(burnTimer && typeof burnTimer === 'number' && burnTimer > 0 && { burnTimer })
    };

    // 🔥 Calculate TTL: use burnTimer if provided, otherwise default 24h
    let ttl = DEFAULT_TTL;
    if (burnTimer && burnTimer > 0) {
      // Use the shorter of burnTimer or default TTL for security
      ttl = Math.min(burnTimer, DEFAULT_TTL);
    }

    // Save to Redis with calculated TTL
    const redis = await getRedisClient();
    await redis.setEx(key, ttl, JSON.stringify(dropData));

    const ttlHours = Math.round(ttl / 3600 * 10) / 10; // Round to 1 decimal
    console.log(`✅ Drop created: ${id} (expires in ${ttlHours}h, 1 view max${burnTimer ? `, burn timer: ${burnTimer}s` : ''})`);

    // Clean response - only the ID and metadata
    res.status(200).json({ 
      success: true, 
      id,
      expiresIn: ttl,
      maxViews: 1,
      ...(burnTimer && { burnTimer })
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message); // Only log error message
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 