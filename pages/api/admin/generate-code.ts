import { NextApiRequest, NextApiResponse } from 'next';
import { generateSingleUseCode } from '../../../lib/access-codes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔧 Admin generate-code API called');
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting code generation...');
    console.log('📍 Environment check:', {
      redisUrl: process.env.REDIS_URL ? 'SET' : 'MISSING',
      nodeEnv: process.env.NODE_ENV
    });
    
    // Timeout wrapper per Vercel
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout after 8 seconds')), 8000);
    });
    
    const codePromise = generateSingleUseCode();
    
    console.log('⏳ Waiting for code generation...');
    const code = await Promise.race([codePromise, timeoutPromise]);
    
    console.log('✅ Code generated successfully:', code);
    
    return res.status(200).json({
      success: true,
      code,
      message: 'Single-use code generated successfully'
    });
  } catch (error) {
    console.error('💥 DETAILED ERROR in generate-code:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Error generating code',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 