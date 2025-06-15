import { NextApiRequest, NextApiResponse } from 'next';
import { generateSingleUseCode } from '../../../lib/access-codes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const code = await generateSingleUseCode();
    
    return res.status(200).json({
      success: true,
      code,
      message: 'Single-use code generated successfully'
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error generating code' 
    });
  }
} 