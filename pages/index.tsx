import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AccessGate from '../components/AccessGate';

export default function LandingPage() {
  const [showAccessGate, setShowAccessGate] = useState(false);
  const router = useRouter();

  const handleEnterApp = () => {
    setShowAccessGate(true);
  };

  const handleAccessGranted = () => {
    setShowAccessGate(false);
    // Use Next.js router with access flag
    router.push('/drop?access=granted');
  };

  // Show access gate popup when requested
  if (showAccessGate) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>GHOSTDROP</title>
        <meta name="description" content="Secure, ephemeral file & message sharing. No accounts. No tracking." />
      </Head>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-4">
        {/* Animated background grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="-mb-16 mt-8">
            <img 
              src="/ghostlogo.png?v=2" 
              alt="GHOSTDROP Logo" 
              className="w-96 h-96 md:w-[30rem] md:h-[30rem] mx-auto object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Title with glitch effect */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-wider">
            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              GHOSTDROP
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            A message that vanishes is still a message.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center">
            <button 
              onClick={handleEnterApp}
              className="px-16 py-5 bg-blue-500 text-black text-xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 rounded-lg transform hover:scale-105"
            >
              Ghost It Now →
            </button>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 uppercase tracking-wider text-blue-400 text-center">
            Zero-Knowledge Architecture
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Client-side Encryption */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/80 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded border border-blue-500 flex items-center justify-center text-blue-400 flex-shrink-0 bg-blue-500/10">
                  <span className="text-lg font-mono">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-blue-400 font-mono">AES-256-GCM ENCRYPTION</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Military-grade encryption happens entirely in your browser. Data is encrypted before 
                    leaving your device. Server receives only encrypted gibberish.
                  </p>
                </div>
              </div>
            </div>

            {/* Zero-Knowledge Design */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/80 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded border border-purple-500 flex items-center justify-center text-purple-400 flex-shrink-0 bg-purple-500/10">
                  <span className="text-lg font-mono">🔑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-purple-400 font-mono">URL FRAGMENT KEYS</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Encryption key travels in URL fragment (#key) - never sent to server. We physically cannot 
                    access your data. Even if compromised, server contains only gibberish.
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-Destruction */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/80 hover:border-red-500/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded border border-red-500 flex items-center justify-center text-red-400 flex-shrink-0 bg-red-500/10">
                  <span className="text-lg font-mono">💥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400 font-mono">AUTO-DESTRUCTION</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Messages auto-delete after first view or 24h expiry. Redis TTL ensures complete 
                    destruction. No recovery possible - true ephemeral messaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy by Design */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/80 hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded border border-green-500 flex items-center justify-center text-green-400 flex-shrink-0 bg-green-500/10">
                  <span className="text-lg font-mono">👤</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-green-400 font-mono">PRIVACY BY DESIGN</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    No accounts, no tracking, no logs. Anonymous by default. Even metadata is minimized. 
                    Your privacy is built into the architecture, not added as an afterthought.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Burn Timer */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/80 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded border border-orange-500 flex items-center justify-center text-orange-400 flex-shrink-0 bg-orange-500/10">
                  <span className="text-lg font-mono">⏱️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-orange-400 font-mono">BURN AFTER READING</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Customizable timers with visual countdown. Choose between instant, 5s, 30s, or 1 minute 
                    destruction. Smooth animations and manual control for maximum flexibility.
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Password Protection */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/80 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded border border-purple-500 flex items-center justify-center text-purple-400 flex-shrink-0 bg-purple-500/10">
                  <span className="text-lg font-mono">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-purple-400 font-mono">PASSWORD PROTECTION</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Optional extra security layer. Custom passwords encrypted client-side with message data. 
                    Double protection: encryption key + password. Zero server-side password storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 uppercase tracking-wider text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create & Share */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/50 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500 text-black font-bold flex items-center justify-center text-2xl mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4 text-blue-400">CREATE & ENCRYPT</h3>
                <p className="text-gray-300 leading-relaxed">
                  Type message or upload file. AES-256-GCM encryption happens in your browser. 
                  Get secure link with key in URL fragment.
                </p>
              </div>
            </div>

            {/* View & Destroy */}
            <div className="p-8 border border-gray-800 rounded-lg bg-black/50 hover:border-red-500/30 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500 text-black font-bold flex items-center justify-center text-2xl mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4 text-red-400">VIEW & DESTROY</h3>
                <p className="text-gray-300 leading-relaxed">
                  Recipient decrypts client-side using key from URL. Message auto-destructs 
                  after viewing. No recovery possible.
                </p>
              </div>
            </div>
          </div>

          {/* Zero-Knowledge Guarantee */}
          <div className="mt-16 p-8 border border-blue-500/30 rounded-lg bg-blue-500/5">
            <h3 className="text-xl font-bold mb-6 text-center text-blue-400 font-mono uppercase tracking-wider">
              Zero-Knowledge Guarantee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center p-4 border border-gray-800 rounded bg-black/50">
                <div className="text-2xl mb-2">🔐</div>
                <h4 className="font-bold text-blue-400 mb-2">YOUR BROWSER</h4>
                <p className="text-gray-400">Encrypts data with AES-256-GCM<br/>Key never leaves your device</p>
              </div>
              <div className="text-center p-4 border border-gray-800 rounded bg-black/50">
                <div className="text-2xl mb-2">🌐</div>
                <h4 className="font-bold text-purple-400 mb-2">OUR SERVER</h4>
                <p className="text-gray-400">Receives only encrypted gibberish<br/>Cannot decrypt without key</p>
              </div>
              <div className="text-center p-4 border border-gray-800 rounded bg-black/50">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-bold text-green-400 mb-2">SHARED LINK</h4>
                <p className="text-gray-400">Key travels in URL fragment (#)<br/>Never sent to server</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-center text-blue-300 text-sm font-mono">
                <strong>TECHNICAL PROOF:</strong> URL fragments (#key) are processed client-side only. 
                Server logs show only the UUID - encryption keys are invisible to us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gray-100 leading-tight">
            The less you leave behind,<br />the more free you are.
          </h3>
          
          <button 
            onClick={handleEnterApp}
            className="px-16 py-5 border-2 border-blue-500 text-blue-400 text-xl font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-black transition-all duration-300 rounded-lg transform hover:scale-105"
          >
            GHOST IT NOW →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm uppercase tracking-wider">
              Open Source • Privacy First • No Tracking
            </p>
            <p className="text-gray-500 text-xs mt-2 font-mono">
              FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Users are responsible for compliance with local laws • © 2025 GHOSTDROP
            </p>
          </div>
          
          {/* Support & Donations Section */}
          <div className="text-center pt-12 space-y-6">
            
            {/* Support */}
            <div>
              <p className="text-gray-400 text-sm mb-2 font-mono uppercase tracking-wider">
                Need Support?
              </p>
              <a 
                href="mailto:ghostdrop@tutamail.com"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-mono"
              >
                <span className="text-lg">📧</span>
                <span>ghostdrop@tutamail.com</span>
              </a>
            </div>

            {/* Donations */}
            <div>
              <p className="text-gray-400 text-sm mb-2 font-mono uppercase tracking-wider">
                Support The Project
              </p>
              <p className="text-gray-500 text-xs mb-3 max-w-md mx-auto">
                We build privacy-focused apps and release them for free. Support development if you find GhostDrop useful.
              </p>
              <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                <span className="text-lg">⟐</span>
                <span className="text-green-400 font-mono text-xs">0xF76aBc4583A9373e3416e75d9043d4A26a80a00F</span>
                <button 
                  onClick={() => navigator.clipboard.writeText('0xF76aBc4583A9373e3416e75d9043d4A26a80a00F')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-xs"
                  title="Copy ETH address"
                >
                  📋
                </button>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Floating Support Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <a 
          href="mailto:ghostdrop@tutamail.com"
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="Support: ghostdrop@tutamail.com"
        >
          <span className="text-xl">📧</span>
        </a>
      </div>
    </div>
  );
} 