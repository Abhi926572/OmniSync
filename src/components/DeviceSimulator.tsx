import React from 'react';
import { useApp } from '../context/AppContext';
import { Maximize2, Laptop, Tablet, Smartphone } from 'lucide-react';

export const DeviceSimulator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deviceFrame, setDeviceFrame } = useApp();

  if (deviceFrame === 'native') {
    return <div className="h-full w-full">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-slate-900/90 p-4 py-8 overflow-y-auto">
      {/* Device Frame Header Switcher */}
      <div className="mb-4 flex items-center gap-3 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-1.5 shadow-xl backdrop-blur-md">
        <span className="text-xs font-semibold text-slate-300">Device Viewport:</span>
        <button
          onClick={() => setDeviceFrame('native')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <Maximize2 className="h-3 w-3" />
          <span>Exit Frame</span>
        </button>
        <div className="h-3 w-px bg-slate-700" />
        <button
          onClick={() => setDeviceFrame('laptop')}
          className={`flex items-center gap-1 text-xs ${
            deviceFrame === 'laptop' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Laptop className="h-3 w-3" />
          <span>Laptop (1024px)</span>
        </button>
        <button
          onClick={() => setDeviceFrame('tablet')}
          className={`flex items-center gap-1 text-xs ${
            deviceFrame === 'tablet' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tablet className="h-3 w-3" />
          <span>Tablet (768px)</span>
        </button>
        <button
          onClick={() => setDeviceFrame('mobile')}
          className={`flex items-center gap-1 text-xs ${
            deviceFrame === 'mobile' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="h-3 w-3" />
          <span>iPhone (390px)</span>
        </button>
      </div>

      {/* Frame Container */}
      {deviceFrame === 'laptop' && (
        <div className="w-full max-w-[1024px] overflow-hidden rounded-2xl border-4 border-slate-700 bg-white shadow-2xl dark:bg-slate-950">
          {/* Laptop Bezel Bar */}
          <div className="flex h-7 items-center justify-between bg-slate-800 px-4">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <span>MacBook Pro 14" (1024 × 700)</span>
            </div>
            <div className="h-2 w-2 rounded-full bg-slate-700" />
          </div>
          <div className="h-[740px] overflow-y-auto">{children}</div>
        </div>
      )}

      {deviceFrame === 'tablet' && (
        <div className="w-full max-w-[768px] overflow-hidden rounded-3xl border-8 border-slate-800 bg-white shadow-2xl dark:bg-slate-950">
          {/* Tablet Status Bar */}
          <div className="flex h-7 items-center justify-between bg-slate-900 px-6 text-[10px] text-slate-400 font-medium">
            <span>9:41 AM</span>
            <div className="h-2 w-2 rounded-full bg-slate-700" />
            <span>100% ⚡</span>
          </div>
          <div className="h-[800px] overflow-y-auto">{children}</div>
        </div>
      )}

      {deviceFrame === 'mobile' && (
        <div className="relative w-full max-w-[390px] overflow-hidden rounded-[44px] border-[10px] border-slate-900 bg-white shadow-2xl dark:bg-slate-950">
          {/* Dynamic Island Bar */}
          <div className="relative z-30 flex h-11 items-center justify-between bg-white px-7 text-[11px] font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
            <span>9:41</span>
            <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black shadow-inner" />
            <div className="flex items-center gap-1.5 text-xs">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
          <div className="h-[720px] overflow-y-auto pb-16">{children}</div>
          {/* iOS Home Indicator Bar */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-32 -translate-x-1/2 rounded-full bg-slate-400/80" />
        </div>
      )}
    </div>
  );
};
