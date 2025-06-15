import { useState } from 'react';

interface AccessGateProps {
  onAccessGranted: () => void;
}

export default function AccessGate({ onAccessGranted }: AccessGateProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // PRIVACY ALTERNATIVE: Could use sessionStorage instead of cookies
        // sessionStorage.setItem('ghostdrop-access', accessCode.trim());
        setShowWelcome(true);
      } else {
        setError(data.error || 'Invalid access code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    onAccessGranted();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Animated background grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo e Titolo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/ghostlogo.png?v=2" 
              alt="GHOSTDROP Logo" 
              className="w-32 h-32 mx-auto object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            GHOSTDROP
          </h1>
          <p className="text-gray-300 text-lg">
            Restricted Access
          </p>
        </div>

        {/* Access Form */}
        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-300 mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your access code"
                disabled={isLoading}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !accessCode.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Access GHOSTDROP'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              🔐 Single-use codes • One drop per access
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            End-to-end encrypted file sharing
          </p>
        </div>
      </div>

      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 border border-green-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Welcome to GHOSTDROP!
                </h3>
                <p className="text-green-200 text-lg mb-4">
                  Single-use access granted
                </p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <p className="text-white text-sm mb-2">
                  <span className="text-green-400 font-semibold">🎯 Single-Use Access:</span>
                </p>
                <p className="text-green-300 font-bold text-lg">
                  Valid Until Drop Creation
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Your access code will expire automatically after you create and copy your first drop link.
                </p>
              </div>

              <button
                onClick={handleWelcomeClose}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Using GHOSTDROP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 