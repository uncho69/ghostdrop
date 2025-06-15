import { NextApiRequest, NextApiResponse } from 'next';
import { expireCodeAfterDrop } from '../../lib/access-codes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the access code from the session cookie
    const cookies = req.headers.cookie;
    const accessCodeMatch = cookies?.match(/ghostdrop-access=([^;]+)/);
    
    if (!accessCodeMatch) {
      return res.status(400).json({ error: 'No active access code found' });
    }
    
    const accessCode = accessCodeMatch[1];
    
    // Expire the code in Redis
    await expireCodeAfterDrop(accessCode);
    
    // Clear the session cookie
    res.setHeader('Set-Cookie', 'ghostdrop-access=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Access code expired successfully' 
    });
  } catch (error) {
    console.error('Error expiring access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 