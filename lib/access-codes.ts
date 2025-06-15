import { getRedisClient } from './redis';

// Generate a single-use code on demand
export async function generateSingleUseCode(): Promise<string> {
  console.log('🎲 generateSingleUseCode: Starting...');
  
  const prefixes = ['GHOST', 'PHANTOM', 'SHADOW', 'CIPHER', 'WRAITH', 'SPECTER', 'ENIGMA', 'VORTEX', 'NEXUS', 'MATRIX', 'QUANTUM'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(Math.random() * 9) + 1; // 1-9
  const randomChars = Math.random().toString(36).substring(2, 4).toUpperCase();
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const code = `${prefix}${randomNum}${randomChars}${randomLetter}`;
  
  console.log('🎯 Generated code pattern:', code);
  
  try {
    console.log('🔌 Attempting Redis connection...');
    const redis = getRedisClient();
    console.log('✅ Redis client obtained');
    
    console.log('💾 Storing code metadata...');
    // Store code as active with metadata - using Upstash syntax
    await redis.hmset(`access_code:${code}`, {
      status: 'active',
      created: Date.now().toString(),
      used: 'false'
    });
    console.log('✅ Code metadata stored');
    
    console.log('📝 Adding to active codes list...');
    // Add to active codes list - using Upstash syntax
    await redis.sadd('active_codes', code);
    console.log('✅ Added to active codes list');
    
    console.log('📊 Incrementing counter...');
    // Increment total generated counter
    await redis.incr('total_codes_generated');
    console.log('✅ Counter incremented');
    
    console.log(`✅ Generated single-use code: ${code}`);
    return code;
  } catch (error) {
    console.error('💥 DETAILED ERROR in generateSingleUseCode:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      redisUrl: process.env.REDIS_URL ? 'SET' : 'MISSING'
    });
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

// Validate and mark code as used (but don't expire yet)
export async function validateAndMarkCode(code: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const upperCode = code.toUpperCase();
    
    // Check if code exists and is active - using Upstash syntax
    const codeData = await redis.hgetall(`access_code:${upperCode}`);
    
    if (!codeData.status || codeData.status !== 'active' || codeData.used === 'true') {
      return false; // Code doesn't exist, expired, or already used
    }
    
    // Mark as used but keep active until drop is created - using Upstash syntax
    await redis.hset(`access_code:${upperCode}`, { used: 'true' });
    
    console.log(`🔓 Code ${upperCode} validated and marked as used`);
    return true;
  } catch (error) {
    console.error('Error validating code:', error);
    return false;
  }
}

// Expire code immediately after drop creation (when user copies link)
export async function expireCodeAfterDrop(code: string): Promise<void> {
  try {
    const redis = getRedisClient();
    const upperCode = code.toUpperCase();
    
    // Move code to expired status - using Upstash syntax
    await redis.hmset(`access_code:${upperCode}`, {
      status: 'expired',
      expired: Date.now().toString()
    });
    
    // Remove from active codes and add to expired - using Upstash syntax
    await redis.srem('active_codes', upperCode);
    await redis.sadd('expired_codes', upperCode);
    
    // Increment total used counter
    await redis.incr('total_codes_used');
    
    console.log(`🗑️ Code ${upperCode} expired after drop creation`);
  } catch (error) {
    console.error('Error expiring code:', error);
  }
}

// Get active codes
export async function getActiveCodes(): Promise<string[]> {
  try {
    const redis = getRedisClient();
    const codes = await redis.smembers('active_codes');
    return codes;
  } catch (error) {
    console.error('Error getting active codes:', error);
    return [];
  }
}

// Get expired codes
export async function getExpiredCodes(): Promise<string[]> {
  try {
    const redis = getRedisClient();
    const codes = await redis.smembers('expired_codes');
    return codes;
  } catch (error) {
    console.error('Error getting expired codes:', error);
    return [];
  }
}

// Get total statistics
export async function getTotalStats(): Promise<{ totalGenerated: number; totalUsed: number }> {
  try {
    const redis = getRedisClient();
    const totalGenerated = await redis.get('total_codes_generated') || '0';
    const totalUsed = await redis.get('total_codes_used') || '0';
    
    return { 
      totalGenerated: parseInt(String(totalGenerated)), 
      totalUsed: parseInt(String(totalUsed)) 
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { totalGenerated: 0, totalUsed: 0 };
  }
}

// Legacy function for backward compatibility - now async
export async function validateAndConsumeCode(code: string): Promise<boolean> {
  return await validateAndMarkCode(code);
} 