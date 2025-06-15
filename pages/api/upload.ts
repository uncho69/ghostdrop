import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from '../../lib/redis';

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
  burnTimer?: number; // 🔥 NEW: Burn timer in seconds
}

interface EncryptedDropData {
  encryptedData: string;
  iv: string;
  salt: string;
  version: string;
  createdAt: number;
  remainingViews: number;
  burnTimer?: number; // 🔥 NEW: Burn timer in seconds
}

// Generate secure random ID (32 chars)
function generateSecureId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
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

  try {
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

    // 🔥 NEW: Validate burn timer if provided
    if (burnTimer !== undefined && burnTimer !== null && (typeof burnTimer !== 'number' || burnTimer < 0 || burnTimer > 300)) {
      return res.status(400).json({ error: 'Invalid burn timer (must be 0-300 seconds)' });
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
      ...(burnTimer && typeof burnTimer === 'number' && burnTimer > 0 && { burnTimer }) // 🔥 NEW: Include burn timer only if valid number > 0
    };

    // Save to Redis with 24h TTL
    const redis = await getRedisClient();
    const expiry = 86400; // 24 hours
    await redis.setEx(key, expiry, JSON.stringify(dropData));

    console.log(`✅ Drop created: ${id} (expires in 24h, 1 view max)`);

    // Clean response - only the ID
    res.status(200).json({ 
      success: true, 
      id,
      expiresIn: expiry,
      maxViews: 1
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 