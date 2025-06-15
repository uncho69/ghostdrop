import { useState, useEffect } from 'react';
import Head from 'next/head';

interface CodeStats {
  active: string[];
  expired: string[];
  totalGenerated: number;
  totalUsed: number;
}

export default function AdminCodes() {
  const [codes, setCodes] = useState<CodeStats>({ active: [], expired: [], totalGenerated: 0, totalUsed: 0 });
  const [newCode, setNewCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCodes();
    // Auto-refresh every 10 seconds to see real-time usage
    const interval = setInterval(fetchCodes, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/admin/codes');
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewCode = async () => {
    setIsGenerating(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/generate-code', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setNewCode(data.code);
        setMessage(`✅ Code generated successfully! Valid for ONE drop only.`);
        
        // Refresh codes list
        setTimeout(() => {
          fetchCodes();
        }, 500);
      } else {
        setMessage('❌ Error generating code');
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = async () => {
    if (newCode) {
      try {
        await navigator.clipboard.writeText(newCode);
        setMessage(`📋 Code copied: ${newCode}`);
      } catch (err) {
        setMessage('❌ Failed to copy code');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>GHOSTDROP - Admin Panel</title>
      </Head>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          🔐 SINGLE-USE CODE GENERATOR
        </h1>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 border border-green-500/30 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{codes.active.length}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Active Codes</div>
          </div>
          
          <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{codes.expired.length}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Expired Codes</div>
          </div>
          
          <div className="bg-gray-900/50 border border-blue-500/30 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{codes.totalGenerated}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total Generated</div>
          </div>
        </div>

        {/* Code Generator */}
        <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-6 text-center">
            ⚡ Generate Single-Use Code
          </h2>
          
          <div className="text-center">
            <button
              onClick={generateNewCode}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 text-lg uppercase tracking-wider"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                '🎲 Generate New Code'
              )}
            </button>
          </div>

          {newCode && (
            <div className="mt-6 p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 mb-3 text-center font-semibold">🎯 NEW CODE READY:</p>
              <div className="bg-black/50 border border-purple-500/50 rounded-lg p-4 mb-4">
                <div className="text-center font-mono text-2xl text-purple-400 tracking-widest">
                  {newCode}
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={copyCode}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  📋 Copy Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
            <p className="text-blue-300 text-center">{message}</p>
          </div>
        )}

        {/* Active Codes List */}
        {codes.active.length > 0 && (
          <div className="bg-gray-900/50 border border-green-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-green-400 mb-4">
              🟢 Active Codes ({codes.active.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {codes.active.map((code, index) => (
                <div key={index} className="bg-green-500/10 border border-green-500/20 rounded p-3 font-mono text-sm text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-300 mb-4">
            📖 Single-Use Code System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-green-400 font-semibold mb-2">✅ How It Works:</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>• Click "Generate New Code" when needed</li>
                <li>• User enters code to access drop page</li>
                <li>• User creates and encrypts message/file</li>
                <li>• Code expires when user copies the link</li>
                <li>• User redirected to homepage automatically</li>
              </ul>
            </div>
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">🔒 Security Features:</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>• One code = One drop only</li>
                <li>• No pre-generated codes waste</li>
                <li>• Immediate expiry after use</li>
                <li>• Real-time monitoring</li>
                <li>• Zero persistent sessions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <a href="/" className="text-gray-500 hover:text-blue-400 transition-colors text-sm uppercase tracking-wider">
            ← Back to GHOSTDROP
          </a>
        </div>
      </div>
    </div>
  );
} 