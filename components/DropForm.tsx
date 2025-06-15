import React, { useState, useRef, useCallback } from 'react';
import { encryptData, generateSecurePassword, fileToBase64, checkCryptoSupport, EncryptedData } from '../lib/crypto';

interface DropFormProps {
  onSuccess: (shareUrl: string) => void;
}

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

export default function DropForm({ onSuccess }: DropFormProps) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState<'message' | 'file'>('message');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🔥 NEW: Burn After Reading Timer
  const [burnTimer, setBurnTimer] = useState<number | null>(null);
  
  // 🔐 NEW: Password Protection (Optional)
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');

  // 🔒 Check crypto support on component mount
  React.useEffect(() => {
    const cryptoCheck = checkCryptoSupport();
    if (!cryptoCheck.supported) {
      setError('❌ Browser does not support secure encryption. Use updated Chrome/Firefox/Safari.');
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Enterprise file validation
    const maxSize = 25 * 1024 * 1024; // 25MB limit
    if (selectedFile.size > maxSize) {
      setError(`⚠️ File too large: ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB (max: 25MB)`);
      return;
    }

    // Security: Block dangerous file types
    const dangerousTypes = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs'];
    const fileName = selectedFile.name.toLowerCase();
    if (dangerousTypes.some(ext => fileName.endsWith(ext))) {
      setError('🚫 File type not allowed for security reasons');
      return;
    }

    setFile(selectedFile);
    setError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contentType === 'message' && !message.trim()) {
      setError('⚠️ Please enter a message');
      return;
    }
    
    if (contentType === 'file' && !file) {
      setError('⚠️ Please select a file');
      return;
    }

    if (enablePassword && !password.trim()) {
      setError('⚠️ Please enter a password or disable password protection');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 🎲 Generate 256-bit encryption key (client-side only!)
      const encryptionKey = generateSecurePassword();
      
      // 📦 Prepare data for encryption
      const dropData: DropData = {};
      
      if (contentType === 'message') {
        dropData.message = message.trim();
      } else if (file) {
        console.log('🔄 Converting file to base64...');
        const fileBase64 = await fileToBase64(file, 25); // 25MB limit
        dropData.file = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: fileBase64
        };
      }

      // 🔐 Add password if enabled
      if (enablePassword && password.trim()) {
        (dropData as any).password = password.trim();
      }

      // 🔐 CRITICAL: Encrypt data client-side with AES-256-GCM
      console.log('🔐 Encrypting data with AES-256-GCM...');
      const encryptedData: EncryptedData = await encryptData(
        JSON.stringify(dropData), 
        encryptionKey
      );

      // 🚀 Upload ONLY encrypted gibberish to server
      console.log('🚀 Uploading encrypted data...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedData: encryptedData.encryptedData,
          iv: encryptedData.iv,
          salt: encryptedData.salt,
          version: encryptedData.version || '1.0',
          burnTimer: burnTimer
        })
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorData}`);
      }

      const result = await uploadResponse.json();
      
      if (!result.success || !result.id) {
        throw new Error('Invalid server response');
      }

      // 🔗 Create secure share URL with encryption key in fragment (client-side only)
      const shareUrl = `${window.location.origin}/view/${result.id}#${encryptionKey}`;
      
      console.log('✅ Drop created successfully!');
      console.log('🔑 Encryption key embedded in URL fragment (never sent to server)');
      
      onSuccess(shareUrl);
      
      // 🧹 Clear form
      setMessage('');
      setFile(null);
      setBurnTimer(null);
      setEnablePassword(false);
      setPassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Drop creation failed:', error);
      setError(error instanceof Error ? error.message : 'Error creating drop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type Selector */}
        <div className="flex rounded-lg border border-gray-700 bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => setContentType('message')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              contentType === 'message'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💬 MESSAGE
          </button>
          <button
            type="button"
            onClick={() => setContentType('file')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              contentType === 'file'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 FILE
          </button>
        </div>

        {/* Message Input */}
        {contentType === 'message' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">
              Your Secret Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your ghost message here..."
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
              required
              disabled={isLoading}
            />
          </div>
        )}

        {/* File Input */}
        {contentType === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">
              Select File
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
                id="file-upload"
                required
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <div className="text-4xl">📁</div>
                <div className="text-gray-400">
                  {file ? (
                    <span className="text-blue-400 font-mono">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-blue-400 hover:text-blue-300">Click to select file</span>
                      <br />
                      <span className="text-xs text-gray-500">Or drag and drop</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* 🔥 NEW: Burn After Reading Timer Selector */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl mb-4">🔥</div>
            <h3 className="text-lg font-bold mb-4 text-orange-400 uppercase tracking-wider">
              Burn After Reading
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Set a timer to automatically destroy the message after it's opened
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <button
                type="button"
                onClick={() => setBurnTimer(null)}
                className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                  burnTimer === null
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                No Timer
              </button>
              <button
                type="button"
                onClick={() => setBurnTimer(5)}
                className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                  burnTimer === 5
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                5 seconds
              </button>
              <button
                type="button"
                onClick={() => setBurnTimer(30)}
                className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                  burnTimer === 30
                    ? 'bg-orange-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                30 seconds
              </button>
              <button
                type="button"
                onClick={() => setBurnTimer(60)}
                className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                  burnTimer === 60
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                1 minute
              </button>
            </div>
            
            {burnTimer && (
              <p className="text-orange-300 text-sm">
                ⏰ Message will self-destruct {burnTimer} seconds after being opened
              </p>
            )}
          </div>
        </div>

        {/* 🔐 NEW: Password Protection (Optional) */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-lg font-bold mb-4 text-purple-400 uppercase tracking-wider">
              Password Protection
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Add an extra layer of security with a custom password
            </p>
            
            {/* Checkbox to enable password */}
            <div className="flex items-center justify-center mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => {
                    setEnablePassword(e.target.checked);
                    if (!e.target.checked) setPassword('');
                  }}
                  className="sr-only"
                />
                <div className={`relative w-6 h-6 rounded border-2 transition-colors ${
                  enablePassword 
                    ? 'bg-purple-500 border-purple-500' 
                    : 'border-gray-600 hover:border-purple-400'
                }`}>
                  {enablePassword && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
                <span className="ml-3 text-gray-300 font-medium">
                  Enable Password Protection
                </span>
              </label>
            </div>
            
            {/* Password input (only shown when enabled) */}
            {enablePassword && (
              <div className="mt-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your custom password..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="text-purple-300 text-xs mt-2">
                  💡 Share this password separately from the drop link for maximum security
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (contentType === 'message' && !message.trim()) || (contentType === 'file' && !file)}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg uppercase tracking-wider transition-all duration-200 text-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>Encrypting & Creating...</span>
            </div>
          ) : (
            '🔐 ENCRYPT & CREATE DROP'
          )}
        </button>
      </form>
    </div>
  );
} 