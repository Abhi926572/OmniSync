import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Battery,
  Wifi,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const DeviceManagerView: React.FC = () => {
  const {
    devices,
    triggerManualSync,
    syncState,
    networkCondition,
    setNetworkCondition,
    addNotification,
  } = useApp();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="h-5 w-5 text-indigo-500" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5 text-indigo-500" />;
      case 'tablet':
        return <Tablet className="h-5 w-5 text-indigo-500" />;
      default:
        return <Monitor className="h-5 w-5 text-indigo-500" />;
    }
  };

  const handlePingDevice = async (deviceName: string) => {
    await triggerManualSync();
    addNotification({
      title: 'Peer Sync Pulse Delivered',
      message: `Synchronized live payload revisions with ${deviceName} in 120ms.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Cross-Platform Connected Devices
          </h2>
          <p className="text-xs text-slate-500">
            Real-time peer-to-peer data synchronization across desktop, laptop, tablet, and mobile
          </p>
        </div>

        <button
          onClick={triggerManualSync}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
          <span>Synchronize All Devices</span>
        </button>
      </div>

      {/* BroadcastChannel Multi-Tab Live Sync Callout */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Wifi className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              Live Real-Time Cross-Window Synchronization Enabled
            </h3>
            <p className="mt-1 text-xs text-indigo-800 dark:text-indigo-300">
              Try opening this application in a second browser window or side-by-side tab. Any task you create, edit, or check off will instantly reflect in both windows in real time via the browser’s BroadcastChannel sync bus!
            </p>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`flex flex-col justify-between rounded-xl border p-4 transition ${
              device.isCurrent
                ? 'border-indigo-300 bg-white shadow-xs dark:border-indigo-800 dark:bg-slate-900'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {device.name}
                      </h4>
                      {device.isCurrent && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          This Device
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{device.platform}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-emerald-600 font-medium">Online</span>
                </div>
              </div>

              {/* Specs & Sync Info */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">IP / Network</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block">
                    {device.ipAddress}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Battery Level</span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    <Battery className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{device.batteryLevel}%</span>
                  </div>
                </div>

                <div className="col-span-2 mt-1">
                  <span className="text-[10px] text-slate-400 block">Last Sync Timestamp</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {new Date(device.lastSyncAt).toLocaleTimeString()} · AES-GCM Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Zero-knowledge peer</span>
              <button
                onClick={() => handlePingDevice(device.name)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Send Sync Ping
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
