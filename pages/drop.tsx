import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DropForm from '../components/DropForm';
import SuccessScreen from '../components/SuccessScreen';
import Logo from '../components/Logo';
import AccessGate from '../components/AccessGate';

export default function DropPage() {
  const [success, setSuccess] = useState(false);
  const [link, setLink] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const router = useRouter();

  // Controlla se l'utente ha già accesso (cookie di sessione o query param)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if access was granted via query parameter
        if (router.query.access === 'granted') {
          setHasAccess(true);
          setIsCheckingAccess(false);
          // Clean up the URL
          router.replace('/drop', undefined, { shallow: true });
          return;
        }

        // Otherwise check cookie
        const response = await fetch('/api/check-access');
        if (response.ok) {
          setHasAccess(true);
        }
      } catch (error) {
        // Ignora errori, l'utente dovrà inserire il codice
      } finally {
        setIsCheckingAccess(false);
      }
    };

    // Only run when router is ready
    if (router.isReady) {
    checkAccess();
    }
  }, [router.isReady, router.query.access]);

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  // Mostra loading durante il controllo iniziale
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  // Mostra schermata di accesso se non autorizzato
  if (!hasAccess) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>GHOSTDROP - Drop</title>
        <meta name="description" content="Share files and messages securely with end-to-end encryption." />
      </Head>

      {/* Header */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors">
            <Logo size={64} />
            <span className="text-xl font-bold tracking-wider">GHOSTDROP</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-400 uppercase tracking-wider">Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider text-blue-400">
              DROP YOUR GHOST
            </h1>
            <p className="text-gray-400 text-lg">
              Encrypt it. Share it. Watch it vanish.
            </p>
          </div>

                     {/* Form Container */}
           <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
            {success ? (
              <SuccessScreen link={link} />
            ) : (
              <DropForm onSuccess={(generatedLink) => {
                setLink(generatedLink);
                setSuccess(true);
              }} />
            )}
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/" className="text-gray-500 hover:text-blue-400 transition-colors text-sm uppercase tracking-wider">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-4 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Secure • Temporary • Encrypted
          </p>
          <p className="text-gray-500 text-xs mt-2 font-mono">
            Educational Use Only
          </p>
                      <div className="flex items-center justify-center space-x-2 mt-1">
              <p className="text-gray-600 text-xs">By Noctivaga</p>
              <a 
                href="https://x.com/nctvga" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-400 transition-colors duration-200"
                aria-label="Follow Noctivaga on X"
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="hover:scale-110 transition-transform duration-200"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
        </div>
      </footer>
    </div>
  );
}