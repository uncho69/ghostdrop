import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from '../../../lib/redis';

interface EncryptedDropData {
  encryptedData: string;
  iv: string;
  salt: string;
  version: string;
  createdAt: number;
  remainingViews: number;
  burnTimer?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Validate ID
  if (!id || typeof id !== 'string' || id.length !== 32) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
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
    console.error('❌ Retrieve error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 