import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Controlla se esiste il cookie di accesso
  const accessCookie = req.cookies['ghostdrop-access'];
  
  // Se esiste un cookie di accesso (contiene il codice), l'accesso è valido
  if (accessCookie && accessCookie.length > 0) {
    return res.status(200).json({ success: true, message: 'Valid access' });
  } else {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
} 