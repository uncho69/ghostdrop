import { useState, useEffect } from 'react';

interface SuccessScreenProps {
  link: string;
}

export default function SuccessScreen({ link }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      
      // Expire the access code after copying the link
      await expireAccessCode();
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const expireAccessCode = async () => {
    setIsExpiring(true);
    
    try {
      // Call API to expire the current access code
      const response = await fetch('/api/expire-access-code', {
        method: 'POST',
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        console.log('✅ Access code expired successfully');
        
        // Redirect to homepage after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (error) {
      console.error('Error expiring access code:', error);
    } finally {
      setIsExpiring(false);
    }
  };

  return (
    <div className="w-full text-center space-y-6">
      <div className="text-4xl mb-6">✨</div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wider text-green-400">
        GHOST LINK READY
      </h1>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 break-all text-sm font-mono text-blue-400">
        {link}
      </div>

      {/* Security Sharing Tooltip */}
      <div className="relative mb-4">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <span>💡</span>
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="hover:text-blue-400 transition-colors underline decoration-dotted"
          >
            Secure sharing tips
          </button>
        </div>
        
        {showTooltip && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg p-4 text-left text-xs z-10 shadow-lg">
            <div className="space-y-2">
              <div className="text-green-400 font-semibold mb-2">🔒 SECURE METHODS:</div>
              <div className="text-gray-300">• Signal, Wire, Element (E2E encrypted)</div>
              <div className="text-gray-300">• ProtonMail, Tutanota (encrypted email)</div>
              <div className="text-gray-300">• Voice call or in-person</div>
              
              <div className="text-yellow-400 font-semibold mt-3 mb-2">⚠️ AVOID:</div>
              <div className="text-gray-400">• Regular email (Gmail, Outlook)</div>
              <div className="text-gray-400">• SMS or unencrypted chat</div>
              
              <div className="text-blue-400 text-center mt-3 pt-2 border-t border-gray-700">
                The link contains the encryption key!
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleCopy}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg uppercase tracking-wider transition-all duration-200"
        disabled={copied || isExpiring}
      >
        {isExpiring ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            <span>Expiring Code...</span>
          </div>
        ) : copied ? '✓ COPIED' : 'COPY LINK'}
      </button>

      {copied && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm font-semibold">
            🎯 Link copied! Access code expired.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Redirecting to homepage in 3 seconds...
          </p>
        </div>
      )}

      <p className="text-gray-500 text-sm">
        Self-destructs after view / time expiry
      </p>
    </div>
  );
} 