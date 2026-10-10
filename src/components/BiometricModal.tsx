import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Fingerprint, Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { notificationService } from '../services/notifications';

export const BiometricModal: React.FC = () => {
  const {
    isLocked,
    isBiometricModalOpen,
    setIsBiometricModalOpen,
    unlockApp,
    verifyBiometrics,
    currentMember,
  } = useApp();

  const [pin, setPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLocked && !isBiometricModalOpen) return null;

  const handleBiometricAuth = async () => {
    setIsScanning(true);
    setErrorMessage('');
    notificationService.triggerHaptic(30);

    try {
      await verifyBiometrics();
      setIsScanning(false);
      setIsBiometricModalOpen(false);
    } catch {
      setIsScanning(false);
      setErrorMessage('Biometric verification failed. Please use PIN.');
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      notificationService.triggerHaptic(15);
      if (nextPin.length === 4) {
        // Check PIN (default '1234')
        if (nextPin === '1234') {
          setTimeout(() => {
            unlockApp();
            setIsBiometricModalOpen(false);
            setPin('');
          }, 200);
        } else {
          setErrorMessage('Invalid PIN. Hint: 1234');
          notificationService.playChime('alert');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center">
        {/* Lock Icon */}
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-950/80 text-indigo-400">
          <Fingerprint
            className={`h-9 w-9 transition-transform duration-700 ${
              isScanning ? 'scale-110 text-emerald-400 animate-pulse' : ''
            }`}
          />
          {isScanning && (
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500 animate-ping opacity-30" />
          )}
        </div>

        <h3 className="text-base font-bold text-white">Vault Encrypted & Locked</h3>
        <p className="mt-1 text-xs text-slate-400">
          Authenticate as <strong className="text-white">{currentMember.name}</strong> to unlock
        </p>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Biometric Trigger */}
        <button
          onClick={handleBiometricAuth}
          disabled={isScanning}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition disabled:opacity-50"
        >
          <Fingerprint className="h-4 w-4" />
          <span>{isScanning ? 'Verifying Hardware Sensor...' : 'Unlock with TouchID / FaceID'}</span>
        </button>

        {/* PIN Entry Divider */}
        <div className="my-5 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[11px] font-medium text-slate-500">OR MASTER PIN</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* 4-digit PIN Dots */}
        <div className="mb-4 flex gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-3 w-3 rounded-full border border-slate-700 transition-colors ${
                pin.length > idx ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid w-full max-w-[240px] grid-cols-3 gap-2 text-sm font-semibold">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinInput(digit)}
              className="flex h-12 items-center justify-center rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 active:scale-95 transition"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePinInput('0')}
            className="flex h-12 items-center justify-center rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handlePinBackspace}
            className="flex h-12 items-center justify-center rounded-xl bg-slate-800/40 text-slate-400 hover:bg-slate-700 active:scale-95 transition text-xs"
          >
            Del
          </button>
        </div>

        <div className="mt-4 text-[10px] text-slate-500">
          Demo PIN: <strong>1234</strong> · Web Crypto AES-256-GCM Secure
        </div>
      </div>
    </div>
  );
};
