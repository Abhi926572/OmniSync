import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Smartphone,
  Shield,
  WifiOff,
  Grid2X2,
  BarChart3,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOnboardingOpen) return null;

  const steps = [
    {
      title: 'Responsive Compact Architecture',
      description:
        'Engineered for seamless fluidity across Desktop (1440px), Laptop (1024px), Tablet (768px), and Mobile (390px). Switch viewports anytime via the top bar.',
      icon: <Smartphone className="h-8 w-8 text-indigo-500" />,
      tag: 'Cross-Platform UI',
    },
    {
      title: 'Offline-First Resilience with IndexedDB',
      description:
        'Create tasks, log focus hours, and organize projects even when disconnected. Mutations queue safely and synchronize instantly upon reconnection.',
      icon: <WifiOff className="h-8 w-8 text-amber-500" />,
      tag: 'Zero Data Loss',
    },
    {
      title: 'Zero-Knowledge AES-256 Encryption & Biometrics',
      description:
        'Every task is secured client-side using PBKDF2 (100,000 iterations) and 256-bit AES-GCM. Protect your vault with FaceID, TouchID, and WebAuthn hardware passkeys.',
      icon: <Shield className="h-8 w-8 text-emerald-500" />,
      tag: 'Hardware Security',
    },
    {
      title: 'Real-Time Sync & Eisenhower Matrix',
      description:
        'Open OmniSync across multiple browser windows or mobile devices to watch state synchronize in real time without lag. Prioritize effectively with 2x2 decision quadrants.',
      icon: <Grid2X2 className="h-8 w-8 text-purple-500" />,
      tag: 'Low-Latency Sync',
    },
    {
      title: 'Productivity Metrics & Encrypted Vault Export',
      description:
        'Visualize velocity trends, 52-week activity heatmaps, and export your entire workspace to CSV, JSON, or AES-encrypted .cipher vault files.',
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      tag: 'Analytics & Export',
    },
  ];

  const handleFinish = () => {
    localStorage.setItem('omnisync_tour_completed', 'true');
    setIsOnboardingOpen(false);
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
            {step.tag}
          </span>
          <button
            onClick={handleFinish}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Icon */}
        <div className="my-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 shadow-inner dark:bg-slate-800/80">
            {step.icon}
          </div>
        </div>

        <h3 className="text-center text-lg font-bold text-slate-900 dark:text-white">
          {step.title}
        </h3>
        <p className="mt-2 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {step.description}
        </p>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <span>Get Started</span>
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
