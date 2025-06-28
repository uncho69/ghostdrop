import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function LegalPage() {
  const effectiveDate = "June 2025";

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Head>
        <title>Privacy & Terms | GhostDrop</title>
        <meta name="description" content="GhostDrop Privacy Policy and Terms of Use - Zero-knowledge file sharing with complete privacy protection" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-black font-bold text-sm">👻</span>
              </div>
              <span className="text-xl font-bold tracking-wider">GHOSTDROP</span>
            </Link>
            
            <Link 
              href="/" 
              className="px-4 py-2 border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-all duration-200 rounded text-sm uppercase tracking-wider"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          
          {/* Title */}
          <div className="text-center border-b border-gray-800 pb-8">
            <h1 className="text-4xl font-bold mb-4 text-blue-400 tracking-wider">
              📄 GHOSTDROP
            </h1>
            <h2 className="text-2xl font-bold mb-2 text-gray-100">
              Privacy & Terms of Use
            </h2>
            <p className="text-gray-400 font-mono">
              Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
            <p className="text-gray-300 leading-relaxed text-lg">
              <strong className="text-blue-400">GhostDrop is designed for privacy, minimalism, and zero retention.</strong> We do not track you. We do not identify you. We cannot see your content.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using GhostDrop, you agree to the following principles:
            </p>
          </div>

          {/* Privacy by Design */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-green-400 flex items-center space-x-3">
              <span>🔐</span>
              <span>Privacy by Design</span>
            </h3>
            
            <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>We do not collect personal information, IP addresses, user agents, or cookies.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>We do not require accounts, authentication, or logins.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>We do not store unencrypted content.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>All data is encrypted in your browser before being sent — we cannot decrypt it.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Stored content self-destructs after first access or a user-defined expiration.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-red-400 flex items-center space-x-3">
              <span>🚫</span>
              <span>Acceptable Use</span>
            </h3>
            
            <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                By using GhostDrop, you agree <strong>not to use</strong> the platform for:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Illegal activities under applicable law</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Sharing or distributing malware, stolen data, or abusive content</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Harassment, threats, or abuse of individuals or systems</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Attempting to overload, exploit, or reverse-engineer the service</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Abuse & Enforcement */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-orange-400 flex items-center space-x-3">
              <span>🛡️</span>
              <span>Abuse & Enforcement</span>
            </h3>
            
            <div className="bg-orange-900/10 border border-orange-500/30 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                While we cannot see the content shared via GhostDrop, we reserve the right to:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Limit or suspend access (e.g. by IP) in case of detected abuse patterns, excessive traffic, or denial-of-service attempts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Comply with valid legal requests, even though we typically have no decryptable information to provide</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Transparency & Changes */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-400 flex items-center space-x-3">
              <span>🔄</span>
              <span>Transparency & Changes</span>
            </h3>
            
            <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6">
              <p className="text-gray-300">
                We may update this policy as the platform evolves. Major changes will be reflected here with a new effective date.
              </p>
            </div>
          </section>

          {/* Technical Details */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-blue-400 flex items-center space-x-3">
              <span>🔧</span>
              <span>Technical Details</span>
            </h3>
            
            <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-6">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Data is encrypted using <strong>AES-256-GCM</strong> with <strong>PBKDF2 (210,000 iterations)</strong></span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Encryption keys are generated in your browser and never transmitted</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Server storage uses Redis with automatic TTL expiration</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>No logs are kept of file contents or access patterns</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-400 flex items-center space-x-3">
              <span>📧</span>
              <span>Contact</span>
            </h3>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-300">
                For abuse reports or legal inquiries: <a href="mailto:ghostdrop@tutamail.com" className="text-blue-400 hover:text-blue-300 transition-colors">ghostdrop@tutamail.com</a>
              </p>
            </div>
          </section>

        </div>

        {/* Back to Top */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 px-6 py-3 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-black transition-all duration-300 rounded-lg font-bold uppercase tracking-wider"
          >
            <span>👻</span>
            <span>Back to GhostDrop</span>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 bg-black mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2025 GhostDrop • Zero-Knowledge File Sharing
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Last updated: {effectiveDate}
          </p>
        </div>
      </footer>

    </div>
  );
} 