import { NextApiRequest, NextApiResponse } from 'next';
import { getActiveCodes, getExpiredCodes, getTotalStats } from '../../../lib/access-codes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const active = await getActiveCodes();
    const expired = await getExpiredCodes();
    const stats = await getTotalStats();

    return res.status(200).json({
      active,
      expired,
      totalGenerated: stats.totalGenerated,
      totalUsed: stats.totalUsed
    });
  } catch (error) {
    console.error('Error retrieving codes:', error);
    return res.status(500).json({ error: 'Error retrieving codes' });
  }
} 