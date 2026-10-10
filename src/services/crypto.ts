/**
 * Web Crypto API Suite - AES-256-GCM + PBKDF2 Zero-Knowledge Engine
 */

import { EncryptedPayload } from '../types';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;
const DEFAULT_PASSPHRASE = 'OmniSync-Secure-Vault-2026';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives an AES-GCM CryptoKey from a user passphrase and salt using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an arbitrary object into AES-256-GCM ciphertext payload
 */
export async function encryptData<T>(
  data: T,
  passphrase = DEFAULT_PASSPHRASE
): Promise<EncryptedPayload> {
  try {
    const enc = new TextEncoder();
    const plaintext = enc.encode(JSON.stringify(data));

    // Generate cryptographic salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passphrase, salt);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      plaintext
    );

    return {
      version: 1,
      iv: arrayBufferToBase64(iv.buffer),
      salt: arrayBufferToBase64(salt.buffer),
      ciphertext: arrayBufferToBase64(ciphertextBuffer),
      tagLength: 128,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Cryptographic encryption failed');
  }
}

/**
 * Decrypts an AES-256-GCM payload back into an object
 */
export async function decryptData<T>(
  payload: EncryptedPayload,
  passphrase = DEFAULT_PASSPHRASE
): Promise<T> {
  try {
    const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const ciphertext = base64ToArrayBuffer(payload.ciphertext);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Decryption failed: Incorrect passphrase or corrupted payload');
  }
}

/**
 * Computes SHA-256 checksum hex string
 */
export async function computeHash(content: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(content);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
