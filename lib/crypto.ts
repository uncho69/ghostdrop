// 🛡️ ENTERPRISE-GRADE CRYPTOGRAPHY LIBRARY
// Zero-knowledge architecture with military-grade AES-256-GCM encryption
// ⚠️  CRITICAL: Server never sees decrypted data or encryption keys

export interface EncryptedData {
  encryptedData: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector (96-bit for GCM)
  salt: string; // Base64 encoded salt for PBKDF2 key derivation
  version: string; // Crypto version for future-proofing
}

// Security constants - DO NOT MODIFY
const CRYPTO_VERSION = '1.0';
const PBKDF2_ITERATIONS = 210000; // OWASP 2023 recommendation (increased from 100k)
const AES_KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes (96 bits for GCM)
const SALT_LENGTH = 32; // bytes (256 bits)
const KEY_LENGTH = 32; // bytes (256 bits)

// 🔒 Secure base64 conversion without call stack overflow
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

// 🔐 Cryptographically secure key derivation using PBKDF2-SHA256
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Input validation
  if (!password || password.length < 32) {
    throw new Error('Invalid encryption key: insufficient entropy');
  }
  
  if (salt.length !== SALT_LENGTH) {
    throw new Error(`Invalid salt length: expected ${SALT_LENGTH} bytes`);
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS, // 210k iterations (OWASP 2023)
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// 🎲 Generate cryptographically secure random key (256-bit)
export function generateSecurePassword(): string {
  if (!crypto || !crypto.getRandomValues) {
    throw new Error('WebCrypto API not available - secure encryption impossible');
  }
  
  const array = new Uint8Array(KEY_LENGTH); // 256 bits
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 🔐 Encrypt data with AES-256-GCM (authenticated encryption)
export async function encryptData(data: string, password: string): Promise<EncryptedData> {
  // Input validation
  if (!data) {
    throw new Error('Cannot encrypt empty data');
  }
  
  if (!password || password.length !== 64) { // 32 bytes = 64 hex chars
    throw new Error('Invalid encryption key format');
  }

  // Check for WebCrypto API availability
  if (!crypto.subtle) {
    throw new Error('WebCrypto API not available - encryption impossible');
  }

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate cryptographically secure random values
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  try {
    // Derive encryption key using PBKDF2
    const key = await deriveKey(password, salt);
    
    // Encrypt with AES-256-GCM (provides authentication)
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    // Secure base64 encoding
    const encryptedArray = new Uint8Array(encryptedBuffer);
    
    return {
      encryptedData: arrayBufferToBase64(encryptedArray),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      version: CRYPTO_VERSION
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 🔓 Decrypt data with AES-256-GCM (with authentication verification)
export async function decryptData(encryptedData: EncryptedData, password: string): Promise<string> {
  // Input validation
  if (!encryptedData || !encryptedData.encryptedData || !encryptedData.iv || !encryptedData.salt) {
    throw new Error('Invalid encrypted data format');
  }
  
  if (!password || password.length !== 64) {
    throw new Error('Invalid decryption key format');
  }

  // Version compatibility check
  if (encryptedData.version && encryptedData.version !== CRYPTO_VERSION) {
    throw new Error(`Unsupported crypto version: ${encryptedData.version}`);
  }

  try {
    // Decode from base64
    const encryptedBuffer = Uint8Array.from(atob(encryptedData.encryptedData), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
    
    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    
    if (salt.length !== SALT_LENGTH) {
      throw new Error('Invalid salt length');
    }
    
    // Derive decryption key
    const key = await deriveKey(password, salt);
    
    // Decrypt with authentication verification
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
    
  } catch (error) {
    // Don't leak specific error details for security
    throw new Error('Decryption failed - invalid key or corrupted data');
  }
}

// 📁 Secure file to base64 conversion with size limits
export function fileToBase64(file: File, maxSizeMB: number = 25): Promise<string> {
  return new Promise((resolve, reject) => {
    // File size validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max: ${maxSizeMB}MB)`));
      return;
    }

    // File type basic validation (prevent executables)
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js'];
    const fileName = file.name.toLowerCase();
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      reject(new Error('File type not allowed for security reasons'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Remove data:type;base64, prefix
        const base64 = result.split(',')[1];
        if (!base64) {
          reject(new Error('Failed to convert file to base64'));
          return;
        }
        resolve(base64);
      } catch (error) {
        reject(new Error('File processing failed'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    reader.readAsDataURL(file);
  });
}

// 🧹 Secure memory cleanup (attempt to clear sensitive data)
export function secureCleanup(sensitiveString: string): void {
  // Note: JavaScript doesn't provide true secure memory wiping,
  // but we can try to overwrite the reference
  try {
    if (typeof sensitiveString === 'string') {
      // This is a best-effort attempt at cleanup
      sensitiveString = '\0'.repeat(sensitiveString.length);
    }
  } catch {
    // Ignore cleanup errors
  }
}

// 🔍 Crypto capability detection
export function checkCryptoSupport(): { supported: boolean; features: string[] } {
  const features: string[] = [];
  let supported = true;

  if (!crypto) {
    return { supported: false, features: ['No Crypto API'] };
  }

  if (!crypto.getRandomValues) {
    supported = false;
    features.push('No secure random');
  } else {
    features.push('Secure random ✓');
  }

  if (!crypto.subtle) {
    supported = false;
    features.push('No WebCrypto');
  } else {
    features.push('WebCrypto ✓');
  }

  return { supported, features };
} 