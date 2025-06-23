import { NextApiRequest, NextApiResponse } from 'next';
import { validateAndMarkCode } from '../../lib/access-codes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({ error: 'Access code required' });
  }

  try {
    const isValid = await validateAndMarkCode(accessCode);

  if (isValid) {
      // Set session cookie with the code for later expiry after drop creation
      res.setHeader('Set-Cookie', `ghostdrop-access=${accessCode.toUpperCase()}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`);
      return res.status(200).json({ 
        success: true, 
        message: 'Access granted - code marked as used and valid until drop creation' 
      });
  } else {
      return res.status(401).json({ error: 'Invalid, expired, or already used access code' });
    }
  } catch (error) {
    console.error('Error validating access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 