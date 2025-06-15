import Link from 'next/link';
import Head from 'next/head';
import Logo from '../components/Logo';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Legal & Terms - GHOSTDROP</title>
        <meta name="description" content="Legal terms and educational disclaimer for GHOSTDROP" />
      </Head>

      {/* Header */}
      <header className="border-b border-gray-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 text-2xl font-bold tracking-wider hover:text-blue-400 transition-colors">
            <Logo size={64} />
            <span>GHOSTDROP</span>
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Educational Purpose Banner */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-400 text-2xl">⚠️</span>
              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-2">EDUCATIONAL PURPOSE DISCLAIMER</h2>
                <p className="text-yellow-200 leading-relaxed">
                  GHOSTDROP is developed and provided <strong>for educational and research purposes only</strong>. 
                  This project demonstrates cryptographic concepts, privacy-preserving technologies, and secure 
                  communication principles for academic study and legitimate research.
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-8 text-center">Legal Terms & Conditions</h1>

          {/* Terms Sections */}
          <div className="space-y-8">
            
            {/* 1. Educational Use */}
            <section className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-4 text-blue-400">1. Educational and Research Use</h3>
              <div className="text-gray-300 space-y-3">
                <p>
                  This software is intended solely for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Academic research and study of cryptographic systems</li>
                  <li>Educational demonstrations of privacy technologies</li>
                  <li>Security research and vulnerability assessment</li>
                  <li>Learning about zero-knowledge architectures</li>
                  <li>Understanding ephemeral data storage concepts</li>
                </ul>
              </div>
            </section>

            {/* 2. User Responsibility */}
            <section className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-4 text-red-400">2. User Responsibility</h3>
              <div className="text-gray-300 space-y-3">
                <p>
                  <strong>Users are solely responsible for:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Compliance with all applicable local, national, and international laws</li>
                  <li>Ensuring content shared does not violate any regulations</li>
                  <li>Understanding legal implications in their jurisdiction</li>
                  <li>Proper and lawful use of encryption technologies</li>
                  <li>Respecting intellectual property and privacy rights</li>
                </ul>
              </div>
            </section>

            {/* 3. Prohibited Uses */}
            <section className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-4 text-red-400">3. Prohibited Uses</h3>
              <div className="text-gray-300 space-y-3">
                <p>
                  GHOSTDROP must NOT be used for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Illegal content distribution or storage</li>
                  <li>Harassment, threats, or malicious communications</li>
                  <li>Copyright infringement or piracy</li>
                  <li>Attempting to encrypt your cat (please use proper pet carriers)</li>
                  <li>Any form of illegal activity or criminal conduct</li>
                  <li>Circumventing legal monitoring or investigation</li>
                  <li>Violating terms of service of other platforms</li>
                </ul>
              </div>
            </section>

            {/* 4. Technical Disclaimer */}
            <section className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-4 text-purple-400">4. Technical Disclaimer</h3>
              <div className="text-gray-300 space-y-3">
                <p>
                  While GHOSTDROP implements strong cryptographic protections:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>No system is 100% secure - use at your own risk</li>
                  <li>We provide no warranties or guarantees of security</li>
                  <li>Users should understand the technical limitations</li>
                  <li>Regular security audits are recommended for production use</li>
                  <li>This is experimental software for educational purposes</li>
                </ul>
              </div>
            </section>

            {/* 5. Zero Liability */}
            <section className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-4 text-gray-400">5. Limitation of Liability</h3>
              <div className="text-gray-300 space-y-3">
                <p>
                  The developers and contributors of GHOSTDROP:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide this software "AS IS" without any warranties</li>
                  <li>Are not liable for any damages or legal consequences</li>
                  <li>Do not endorse or encourage illegal activities</li>
                  <li>Cannot be held responsible for user actions or content</li>
                  <li>Disclaim all liability for misuse of this technology</li>
                </ul>
              </div>
            </section>

            {/* 6. Open Source */}
            <section className="border border-gray-800 rounded-lg p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-4 text-green-400">6. Open Source License</h3>
              <div className="text-gray-300 space-y-3">
                <p>
                  GHOSTDROP is open source software:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Source code is available for inspection and audit</li>
                  <li>Licensed under MIT License for educational use</li>
                  <li>Community contributions are welcome</li>
                  <li>Transparency ensures no hidden backdoors</li>
                  <li>Educational modifications are encouraged</li>
                </ul>
              </div>
            </section>

          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              For questions about these terms or educational use cases, contact the development team.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Last updated: December 2025
            </p>
          </div>

        </div>
      </main>
    </div>
  );
} 