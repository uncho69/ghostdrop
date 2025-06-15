export interface EncryptedData {
  iv: string;
  data: string;
}

export async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(data: string | ArrayBuffer, key: CryptoKey): Promise<EncryptedData> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedData
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
  };
}

export async function decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
  const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
} 