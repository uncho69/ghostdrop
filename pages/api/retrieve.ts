import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, getDropKey } from '../../lib/redis';
import type { RetrieveResponse, DropData } from '../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RetrieveResponse | { error: string }>
) {
  // Solo GET consentito
  if (req.method !== 'GET') {
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

    // Recupera dati da Redis
    const rawData = await redis.get(key);

    if (!rawData) {
      return res.status(404).json({ error: 'Drop not found or expired' });
    }

    // Parse dei dati
    const dropData: DropData = JSON.parse(rawData);

    // Decrementa le visualizzazioni rimanenti
    dropData.remainingViews -= 1;

    // Se non ci sono più visualizzazioni, elimina immediatamente
    if (dropData.remainingViews <= 0) {
      await redis.del(key);
    } else {
      // Altrimenti aggiorna i dati con le visualizzazioni decrementate
      // Mantieni il TTL originale
      const ttl = await redis.ttl(key);
      if (ttl > 0) {
        await redis.setEx(key, ttl, JSON.stringify(dropData));
      }
    }

    // Risposta con i dati criptati (il client li decripterà)
    const response: RetrieveResponse = {
      type: dropData.type,
      data: dropData.data, // Dati ancora criptati
      ...(dropData.filename && { filename: dropData.filename })
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 