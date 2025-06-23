import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { decryptData, checkCryptoSupport, EncryptedData } from '../../lib/crypto';

interface DropData {
  message?: string;
  file?: {
    name: string;
    size: number;
    type: string;
    data: string; // base64
  };
  password?: string; // 🔐 NEW: Optional password protection
}

export default function ViewDrop() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [decryptedContent, setDecryptedContent] = useState<DropData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 🔐 NEW: Password Protection States
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [tempDecryptedData, setTempDecryptedData] = useState<DropData | null>(null); // Store data temporarily
  const [serverBurnTimer, setServerBurnTimer] = useState<number>(0); // Store burn timer from server
  
  // 🔥 Burn After Reading - now controlled by server data
  const [countdown, setCountdown] = useState<number>(0);
  const [isExploding, setIsExploding] = useState(false);
  const [initialBurnTimer, setInitialBurnTimer] = useState<number>(0); // For progress bar

  useEffect(() => {
    async function loadAndDecrypt() {
    if (!id || typeof id !== 'string') return;

      try {
        setIsLoading(true);

        // 🔒 Security check: Verify crypto support
        const cryptoCheck = checkCryptoSupport();
        if (!cryptoCheck.supported) {
          throw new Error('Browser does not support secure encryption. Use updated Chrome/Firefox/Safari.');
        }

        // 🔑 Extract encryption key from URL fragment (client-side only!)
        const encryptionKey = window.location.hash.slice(1);
        
        if (!encryptionKey || encryptionKey.length !== 64) {
          throw new Error('Missing or invalid decryption key. Check that the URL is complete.');
        }

        console.log('🔍 Fetching encrypted drop...');
        
        // 📥 Fetch encrypted data from server
        const response = await fetch(`/api/retrieve/${id}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.status === 404) {
          throw new Error('Drop not found or already expired');
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to retrieve drop: ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Invalid data received from server');
        }

        console.log('🔐 Starting client-side decryption...');

        // 🔓 Prepare encrypted data structure
        const encryptedData: EncryptedData = {
          encryptedData: result.data.encryptedData,
          iv: result.data.iv,
          salt: result.data.salt,
          version: result.data.version || '1.0'
        };
          
        // 🔓 CRITICAL: Decrypt data client-side
        let decryptedJson: string;
        let dropData: DropData;
        
        try {
          decryptedJson = await decryptData(encryptedData, encryptionKey);
          dropData = JSON.parse(decryptedJson);
          console.log('✅ Decryption successful!');
        } catch (decryptError) {
          // 🚨 Report failed decryption attempt to server
          try {
            await fetch('/api/report-failed-decrypt', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id })
            });
          } catch (reportError) {
            console.warn('Failed to report decryption failure:', reportError);
          }
          
          throw new Error('Decryption failed - invalid key or corrupted data');
        }
        
        // 🔐 NEW: Check if password protection is enabled
        if (dropData.password) {
          console.log('🔐 Drop is password protected');
          setTempDecryptedData(dropData); // Save data temporarily
          
          // 🔥 NEW: Save burn timer from server for later use
          if (result.data.burnTimer && result.data.burnTimer > 0) {
            console.log(`🔥 Saving burn timer for password-protected drop: ${result.data.burnTimer} seconds`);
            setServerBurnTimer(result.data.burnTimer);
          }
          
          setRequiresPassword(true);
          setIsLoading(false);
          return; // Don't show content yet, wait for password
        }
        
        console.log('🧹 Clearing encryption key from memory...');
        
        // 🧹 Security: Clear URL fragment to remove key from browser history
        window.history.replaceState(null, '', window.location.pathname);

        setDecryptedContent(dropData);

        // 🔥 NEW: Start burn timer if set by creator
        if (result.data.burnTimer && result.data.burnTimer > 0) {
          console.log(`🔥 Starting burn timer: ${result.data.burnTimer} seconds`);
          setCountdown(result.data.burnTimer);
          setInitialBurnTimer(result.data.burnTimer);
        }

      } catch (err) {
        console.error('❌ Decryption failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to decrypt');
      } finally {
        setIsLoading(false);
      }
    }

    loadAndDecrypt();
  }, [id]);

  // 🔥 NEW: Burn Timer Effect
  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // 💥 EXPLOSION TIME!
          setIsExploding(true);
          setTimeout(() => {
            router.push('/');
          }, 2000); // Redirect after explosion animation
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, router]);

  // 🔥 Manual Destruction Function
  const destroyNow = () => {
    setIsExploding(true);
    setTimeout(() => {
      router.push('/');
    }, 2000); // Redirect after explosion animation
  };

  // 🔐 NEW: Password Validation Function
  const validatePassword = () => {
    if (!tempDecryptedData?.password) return;
    
    if (enteredPassword.trim() === tempDecryptedData.password) {
      console.log('✅ Password correct, showing content');
      
      // Remove password from data before showing
      const { password, ...contentWithoutPassword } = tempDecryptedData;
      setDecryptedContent(contentWithoutPassword);
      
      setRequiresPassword(false);
      setPasswordError('');
      
      // 🔥 NEW: Start burn timer if set (use serverBurnTimer for password-protected drops)
      if (serverBurnTimer > 0) {
        console.log(`🔥 Starting burn timer after password validation: ${serverBurnTimer} seconds`);
        setCountdown(serverBurnTimer);
        setInitialBurnTimer(serverBurnTimer);
      }
    } else {
      console.log('❌ Incorrect password');
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const downloadFile = (file: DropData['file']) => {
    if (!file) return;

    try {
      // Convert base64 to blob
      const byteCharacters = atob(file.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

      // Create download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // 💥 EXPLOSION OVERLAY
  if (isExploding) {
    return (
      <div className="fixed inset-0 bg-black text-white font-mono flex items-center justify-center z-50">
        <Head>
          <title>GHOSTDROP - 💥 BOOM!</title>
        </Head>
        <div className="text-center">
          <div className="text-9xl mb-8 animate-bounce">💥</div>
          <div className="text-6xl mb-4 animate-pulse text-red-500">BOOM!</div>
          <div className="text-2xl mb-4 text-red-400 animate-pulse">MESSAGE DESTROYED</div>
          <div className="text-lg text-gray-400">Redirecting to safety...</div>
          
          {/* Explosion particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <Head>
          <title>GHOSTDROP - Decrypting</title>
        </Head>
        <div className="text-center">
          <div className="text-6xl mb-6">👻</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-mono uppercase tracking-wider">Decrypting Ghost Message...</p>
          <p className="text-sm text-gray-500 mt-2">AES-256-GCM client-side decryption</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <Head>
          <title>GHOSTDROP - Ghost Vanished</title>
        </Head>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">👻</div>
          <h1 className="text-2xl font-bold mb-4 text-red-400 uppercase tracking-wider">GHOST VANISHED</h1>
          <p className="text-gray-400 mb-6 leading-relaxed">{error}</p>
          <Link 
            href="/" 
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // 🔐 NEW: Password Input Screen
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <Head>
          <title>GHOSTDROP - Password Required</title>
        </Head>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-2xl font-bold mb-4 text-purple-400 uppercase tracking-wider">
            Password Required
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            This ghost message is protected with a password. Enter the password to reveal the content.
          </p>
          
          <div className="space-y-4">
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => {
                setEnteredPassword(e.target.value);
                setPasswordError(''); // Clear error when typing
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  validatePassword();
                }
              }}
              placeholder="Enter password..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none font-mono text-sm"
              autoFocus
            />
            
            {passwordError && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {passwordError}
              </div>
            )}
            
            <button
              onClick={validatePassword}
              disabled={!enteredPassword.trim()}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
              🔓 Unlock Ghost
            </button>
            
            <Link 
              href="/" 
              className="inline-block text-gray-400 hover:text-white text-sm uppercase tracking-wider transition-colors mt-4"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>GHOSTDROP - Ghost Revealed</title>
        <meta name="description" content="Decrypted ghost message" />
      </Head>

      {/* Animated background grid */}
      <div className="fixed inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👻</div>
          <h1 className="text-3xl font-bold mb-2 text-green-400 uppercase tracking-wider">GHOST REVEALED</h1>
          <p className="text-gray-400">Decrypted client-side • Self-destructs after viewing</p>
        </div>

        {/* Content */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-8 mb-8 backdrop-blur-sm">
          {decryptedContent?.message ? (
            <>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">💬</span>
                <span className="text-sm uppercase tracking-wider text-gray-400 font-bold">Secret Message</span>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-6">
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-100 font-mono leading-relaxed">
                  {decryptedContent.message}
                </pre>
              </div>
            </>
          ) : decryptedContent?.file ? (
            <>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">📁</span>
                <span className="text-sm uppercase tracking-wider text-gray-400 font-bold">Encrypted File</span>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-lg mb-2 text-blue-400 font-mono font-bold">
                  {decryptedContent.file.name}
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  {(decryptedContent.file.size / 1024 / 1024).toFixed(2)} MB • {decryptedContent.file.type || 'Unknown type'}
              </p>
              <button
                  onClick={() => downloadFile(decryptedContent.file)}
                  className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-colors"
              >
                  💾 Download File
              </button>
            </div>
            </>
          ) : null}
        </div>

        {/* 🔥 NEW: Active Countdown Display */}
        {countdown > 0 && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-8 text-center animate-pulse">
            <div className="text-4xl mb-4">⏰</div>
            <div className="text-3xl font-bold text-red-400 mb-2">
              {countdown}
                </div>
            <p className="text-red-300 text-sm uppercase tracking-wider">
              Seconds until destruction
            </p>
            <div className="mt-4 bg-red-500/30 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-red-500 h-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${initialBurnTimer > 0 ? (countdown / initialBurnTimer) * 100 : 0}%` 
                }}
              />
                  </div>
                </div>
              )}
              
        {/* Actions */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
              ← Back to Home
            </Link>
            <Link 
              href="/drop" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-black font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
                Create New Drop
              </Link>
            {/* 🔥 NEW: Manual Destroy Button */}
            <button
              onClick={destroyNow}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              💥 Destroy Now
            </button>
            </div>
        </div>
      </div>
    </div>
  );
} 