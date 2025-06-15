import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { importKey, decrypt } from '../../lib/encryption';

interface DropData {
  type: 'text' | 'file';
  data: {
    iv: string;
    data: string;
  };
  filename?: string;
}

export default function DropPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dropData, setDropData] = useState<DropData | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDrop = async () => {
      try {
        const response = await fetch(`/api/retrieve?id=${id}`);
        if (!response.ok) {
          throw new Error('Drop non trovato o scaduto');
        }
        const data = await response.json();
        setDropData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrop();
  }, [id]);

  useEffect(() => {
    if (!dropData || !window.location.hash) return;

    const decryptContent = async () => {
      try {
        const keyString = window.location.hash.slice(1);
        const key = await importKey(keyString);
        const decrypted = await decrypt(dropData.data, key);
        setDecryptedContent(decrypted);

        // Se è un file, scaricalo automaticamente
        if (dropData.type === 'file' && dropData.filename) {
          const blob = new Blob([decrypted], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = dropData.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        setError('Errore durante la decrittazione');
      }
    };

    decryptContent();
  }, [dropData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Errore</h1>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 btn btn-primary"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  if (dropData?.type === 'file') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">File Scaricato</h1>
          <p>Il file è stato scaricato automaticamente.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 btn btn-primary"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-secondary rounded-lg p-6">
            <pre className="whitespace-pre-wrap break-words">
              {decryptedContent}
            </pre>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-6 btn btn-primary"
          >
            Torna alla Home
          </button>
        </div>
      </main>
    </div>
  );
} 