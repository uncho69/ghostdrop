import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { getRedisClient, generateSecureId, getDropKey } from '../../lib/redis';
import { fileToBase64 } from '../../lib/crypto';

export const config = {
  api: {
    bodyParser: false, // Necessario per formidable
  },
};

interface DropResponse {
  link: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DropResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 30 * 1024 * 1024, // 30MB
      maxFiles: 1,
    });

    const [fields, files] = await form.parse(req);
    
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
    
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    let data: string;
    let filename: string | undefined;

    if (type === 'message') {
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      data = message;
    } else if (type === 'file') {
      const fileArray = files.file;
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
      
      if (!file) {
        return res.status(400).json({ error: 'File is required' });
      }

      // Leggi il file e convertilo in base64
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(file.filepath);
      data = fileBuffer.toString('base64');
      filename = file.originalFilename || 'unnamed';
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    // Genera ID sicuro
    const id = generateSecureId();
    const key = getDropKey(id);

    // Prepara dati per Redis (i dati NON sono criptati qui - la crittografia è client-side)
    const dropData = {
      type,
      data,
      remainingViews: 1, // Self-destruct dopo 1 view
      createdAt: Date.now(),
      ...(filename && { filename })
    };

    // Salva in Redis con TTL di 24 ore
    const redis = await getRedisClient();
    await redis.setEx(key, 86400, JSON.stringify(dropData)); // 24 ore

    // Genera URL con hash per la chiave di crittografia
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const link = `${baseUrl}/view/${id}`;

    res.status(200).json({ link });

  } catch (error) {
    console.error('Drop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 