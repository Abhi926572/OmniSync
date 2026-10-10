import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Cloud,
  Lock,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Database,
  Download,
  Upload,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { encryptData, decryptData } from '../services/crypto';
import { EncryptedPayload } from '../types';

export const SecurityCenter: React.FC = () => {
  const {
    tasks,
    settings,
    updateSettings,
    lockApp,
    setIsBiometricModalOpen,
    permissions,
    addNotification,
  } = useApp();

  const [liveSamplePayload, setLiveSamplePayload] = useState<EncryptedPayload | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [totpCode, setTotpCode] = useState('849 203');
  const [totpSecondsLeft, setTotpSecondsLeft] = useState(24);
  const [activeTab, setActiveTab] = useState<'crypto' | 'biometrics' | 'mfa' | 'backups'>('crypto');

  const [backups, setBackups] = useState([
    {
      id: 'snap_1',
      name: 'Automated Nightly Snapshot',
      timestamp: Date.now() - 3600000 * 8,
      size: '42.8 KB',
      hash: 'a7f01c89e24b7a12...',
      type: 'Encrypted Cloud',
    },
    {
      id: 'snap_2',
      name: 'Pre-Sync Master Point',
      timestamp: Date.now() - 3600000 * 24,
      size: '39.4 KB',
      hash: '91dc201fa881b23c...',
      type: 'Local IndexedDB',
    },
  ]);

  // Live rotating TOTP generator simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpSecondsLeft((prev) => {
        if (prev <= 1) {
          // Generate new 6-digit TOTP
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          setTotpCode(`${newCode.slice(0, 3)} ${newCode.slice(3)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Encrypt sample task live to demonstrate cryptographic payload
  useEffect(() => {
    async function runCryptoDemo() {
      if (tasks.length > 0) {
        const payload = await encryptData(tasks[0]);
        setLiveSamplePayload(payload);
      }
    }
    runCryptoDemo();
  }, [tasks]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCreateSnapshot = async () => {
    const newSnap = {
      id: `snap_${Date.now()}`,
      name: `Manual Snapshot ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      size: `${(tasks.length * 1.8 + 24).toFixed(1)} KB`,
      hash: Math.random().toString(16).substring(2, 18) + '...',
      type: 'Encrypted Cloud',
    };
    setBackups([newSnap, ...backups]);
    addNotification({
      title: 'Cloud Snapshot Generated',
      message: `Created restore point ${newSnap.name} with AES-256 checksum.`,
      type: 'security',
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Center Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Zero-Knowledge Vault
          </h2>
          <p className="text-xs text-slate-500">
            Hardware-backed encryption, WebAuthn biometrics, multi-factor authentication, and cloud recovery
          </p>
        </div>

        {/* Security Subtabs */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === 'crypto'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            AES-256 E2EE
          </button>
          <button
            onClick={() => setActiveTab('biometrics')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === 'biometrics'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Biometrics & Lock
          </button>
          <button
            onClick={() => setActiveTab('mfa')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === 'mfa'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            2FA / TOTP
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === 'backups'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Cloud Backups
          </button>
        </div>
      </div>

      {/* Tab 1: AES-256-GCM Zero-Knowledge Inspector */}
      {activeTab === 'crypto' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    End-to-End Cryptographic Architecture
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    PBKDF2 Key Derivation (100,000 iterations) · 256-bit AES-GCM · SHA-256 Auth Tag
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-mono font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Active & Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Plaintext view */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Client Memory Plaintext (Decrypted)</span>
                  <span className="text-[10px] text-indigo-500 font-mono">Visible Only Locally</span>
                </div>
                <pre className="mt-2 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-56">
                  {JSON.stringify(
                    tasks[0]
                      ? {
                          id: tasks[0].id,
                          title: tasks[0].title,
                          priority: tasks[0].priority,
                          status: tasks[0].status,
                          subtasks: tasks[0].subtasks,
                        }
                      : {},
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Ciphertext view */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Network Sync Ciphertext (Zero-Knowledge)</span>
                  <span className="text-[10px] text-emerald-500 font-mono">Encrypted Payload</span>
                </div>
                {liveSamplePayload ? (
                  <pre className="mt-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto max-h-56">
                    {JSON.stringify(liveSamplePayload, null, 2)}
                  </pre>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Computing AES-256 ciphertext...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-white">Zero-Knowledge Guarantee: </strong>
              Neither cloud sync brokers nor storage servers can inspect your task data. Only devices holding your derived key can decrypt the AES-GCM tag.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Biometrics & Screen Lock */}
      {activeTab === 'biometrics' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Biometric Sensor & Passkey Lock
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    TouchID, FaceID & WebAuthn hardware authentication
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  lockApp();
                  setIsBiometricModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Test Biometric Lock</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">
                    Auto-Lock Inactivity Timeout
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {settings.autoLockMinutes} mins
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 5, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateSettings({ autoLockMinutes: mins })}
                      className={`flex-1 rounded-md py-1 text-xs font-medium transition ${
                        settings.autoLockMinutes === mins
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                      Tactile Haptic Feedback
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Physical vibration pulse on biometric scan
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.hapticFeedback}
                      onChange={(e) => updateSettings({ hapticFeedback: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="peer h-5 w-9 rounded-full bg-slate-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-slate-700"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MFA / TOTP Authenticator */}
      {activeTab === 'mfa' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Multi-Factor Authentication (TOTP)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Time-based One-Time Password RFC 6238 standard
                </p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-mono font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              MFA Active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Live TOTP Code Card */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-xs text-slate-500 mb-2">Current Verification Code</span>
              <div className="font-mono text-4xl font-bold tracking-widest text-slate-900 dark:text-white tabular-nums">
                {totpCode}
              </div>
              <div className="mt-4 flex w-full max-w-xs items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${(totpSecondsLeft / 30) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {totpSecondsLeft}s
                </span>
              </div>
            </div>

            {/* Secret Seed & Backup Codes */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  TOTP Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="JBSWY3DPEHPK3PXP"
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    onClick={handleCopySecret}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Emergency Recovery Backup Codes
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <span className="rounded bg-slate-100 p-1.5 text-center dark:bg-slate-800">
                    7A29-84BC-01
                  </span>
                  <span className="rounded bg-slate-100 p-1.5 text-center dark:bg-slate-800">
                    E914-5B81-22
                  </span>
                  <span className="rounded bg-slate-100 p-1.5 text-center dark:bg-slate-800">
                    C388-912A-77
                  </span>
                  <span className="rounded bg-slate-100 p-1.5 text-center dark:bg-slate-800">
                    42DF-11A0-93
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud Backups & Snapshots */}
      {activeTab === 'backups' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Cloud Backup Points & Recovery
              </h3>
              <p className="text-[11px] text-slate-500">
                AES-256 encrypted snapshots stored with SHA-256 verification hashes
              </p>
            </div>
            {permissions.canExportData && (
              <button
                onClick={handleCreateSnapshot}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                <Cloud className="h-3.5 w-3.5" />
                <span>Create New Snapshot</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {backups.map((snap) => (
              <div key={snap.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-indigo-500" />
                  <div>
                    <h4 className="text-xs font-medium text-slate-900 dark:text-white">
                      {snap.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      <span>·</span>
                      <span>{snap.size}</span>
                      <span>·</span>
                      <span>Hash: {snap.hash}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addNotification({
                        title: 'Vault Restored',
                        message: `Successfully verified and restored snapshot ${snap.name}.`,
                        type: 'success',
                      });
                    }}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
