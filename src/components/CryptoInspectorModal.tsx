import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EncryptedPayload, Task } from '../types';
import { X, Lock, ShieldCheck, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { encryptData, decryptData } from '../services/crypto';

export const CryptoInspectorModal: React.FC = () => {
  const {
    isCryptoInspectorOpen,
    setIsCryptoInspectorOpen,
    inspectingTask,
    setInspectingTask,
  } = useApp();

  const [payload, setPayload] = useState<EncryptedPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<Task | null>(null);

  useEffect(() => {
    async function compute() {
      if (inspectingTask) {
        const encrypted = await encryptData(inspectingTask);
        setPayload(encrypted);
        setDecryptedResult(null);
      }
    }
    compute();
  }, [inspectingTask, isCryptoInspectorOpen]);

  if (!isCryptoInspectorOpen || !inspectingTask) return null;

  const handleTestDecryption = async () => {
    if (!payload) return;
    setIsVerifying(true);
    try {
      const dec = await decryptData<Task>(payload);
      setDecryptedResult(dec);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Zero-Knowledge Cryptographic Inspector
              </h3>
              <p className="text-[11px] text-slate-500">
                AES-GCM 256-bit symmetric encryption · PBKDF2 100k Key Derivation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCryptoInspectorOpen(false);
              setInspectingTask(null);
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-950">
            <span className="font-semibold text-slate-900 dark:text-white">Inspecting Task: </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">{inspectingTask.title}</span>
          </div>

          {/* Cipher Details */}
          {payload && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">INITIALIZATION VECTOR (IV)</span>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
                  {payload.iv}
                </span>
                <span className="mt-1 text-[10px] text-slate-400 block">Random 96-bit nonce</span>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">CRYPTOGRAPHIC SALT</span>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
                  {payload.salt}
                </span>
                <span className="mt-1 text-[10px] text-slate-400 block">128-bit PBKDF2 derivation salt</span>
              </div>

              <div className="col-span-full rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">
                  AES-256-GCM CIPHERTEXT (TRANSMITTED PAYLOAD)
                </span>
                <div className="mt-1 max-h-24 overflow-y-auto rounded bg-slate-100 p-2 font-mono text-[11px] text-emerald-600 dark:bg-slate-950 dark:text-emerald-400 break-all">
                  {payload.ciphertext}
                </div>
              </div>
            </div>
          )}

          {/* Decryption test demonstration */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Client Key Verification Test
              </span>
              <button
                onClick={handleTestDecryption}
                disabled={isVerifying}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {isVerifying ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                <span>Verify & Decrypt with Client Key</span>
              </button>
            </div>

            {decryptedResult ? (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Decryption Successful! Authentication Tag Verified.</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  Plaintext match: "{decryptedResult.title}" (Status: {decryptedResult.status})
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Click verify to test AES-GCM tag authentication using the local derived key.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-3 dark:border-slate-800">
          <button
            onClick={() => setIsCryptoInspectorOpen(false)}
            className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
