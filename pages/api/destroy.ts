import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, getDropKey } from '../../lib/redis';
import type { DestroyResponse } from '../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DestroyResponse | { error: string }>
) {
  // Solo POST consentito per sicurezza
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Validazione ID
  if (!id || typeof id !== 'string' || id.length !== 32) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const redis = await getRedisClient();
    const key = getDropKey(id);

    // Elimina la chiave da Redis
    const deleted = await redis.del(key);

    // Risposta sempre success, anche se la chiave non esisteva
    // (per non rivelare informazioni sull'esistenza di drop)
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Destroy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 