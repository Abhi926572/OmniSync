import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Plus,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Shield,
  Smartphone,
  Laptop,
  Tablet,
  Maximize2,
  HelpCircle,
  Timer,
  Play,
  Pause,
} from 'lucide-react';
import { DeviceFrameMode } from '../types';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    deviceFrame,
    setDeviceFrame,
    syncState,
    networkCondition,
    setNetworkCondition,
    triggerManualSync,
    isLocked,
    lockApp,
    setIsBiometricModalOpen,
    unreadNotificationCount,
    currentMember,
    setCurrentMember,
    teamMembers,
    permissions,
    setIsTaskModalOpen,
    setEditingTask,
    setIsOnboardingOpen,
    setIsShortcutsOpen,
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
  } = useApp();

  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showPomodoroMini, setShowPomodoroMini] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Zone 1: Single text element wordmark + Quick Frame Selector */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('tasks');
          }}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">OmniSync</span>
        </a>

        {/* Viewport Frame Switcher (Compact Desktop/Laptop/Tablet/Mobile simulator) */}
        <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950 lg:flex">
          <button
            title="Native Responsive (Full Screen)"
            onClick={() => setDeviceFrame('native')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              deviceFrame === 'native'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Fluid</span>
          </button>
          <button
            title="Laptop View (1024px)"
            onClick={() => setDeviceFrame('laptop')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              deviceFrame === 'laptop'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Laptop</span>
          </button>
          <button
            title="Tablet View (768px)"
            onClick={() => setDeviceFrame('tablet')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              deviceFrame === 'tablet'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
            <span>Tablet</span>
          </button>
          <button
            title="Mobile View (390px)"
            onClick={() => setDeviceFrame('mobile')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              deviceFrame === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Zone 2: Primary navigation links (single line, whitespace-nowrap) */}
      <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
            activeTab === 'tasks' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          Tasks & Kanban
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
            activeTab === 'matrix' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          Priority Matrix
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
            activeTab === 'analytics' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          Productivity Metrics
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
            activeTab === 'team' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          Collaboration & RBAC
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
            activeTab === 'security' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          Vault & E2EE
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
            activeTab === 'devices' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          Devices
        </button>
      </nav>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network & Sync Status Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNetworkMenu(!showNetworkMenu)}
            title={`Network: ${networkCondition} | Sync: ${syncState}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {networkCondition === 'offline' ? (
              <WifiOff className="h-3.5 w-3.5 text-rose-500" />
            ) : (
              <Wifi className={`h-3.5 w-3.5 ${networkCondition === 'flaky' ? 'text-amber-500' : 'text-emerald-500'}`} />
            )}
            <span className="hidden sm:inline">
              {networkCondition === 'offline' ? 'Offline' : syncState === 'syncing' ? 'Syncing...' : 'Synced'}
            </span>
            <RefreshCw
              className={`h-3 w-3 text-slate-400 ${syncState === 'syncing' ? 'animate-spin text-indigo-500' : ''}`}
            />
          </button>

          {showNetworkMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Network & Sync Simulator
              </div>
              <button
                onClick={() => {
                  setNetworkCondition('online');
                  setShowNetworkMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium ${
                  networkCondition === 'online'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Online (Low-latency 5G)</span>
                <span className="text-[10px] text-emerald-600">Active</span>
              </button>
              <button
                onClick={() => {
                  setNetworkCondition('flaky');
                  setShowNetworkMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium ${
                  networkCondition === 'flaky'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Flaky / 3G Simulation</span>
                <span className="text-[10px] text-amber-600">Throttled</span>
              </button>
              <button
                onClick={() => {
                  setNetworkCondition('offline');
                  setShowNetworkMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium ${
                  networkCondition === 'offline'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Offline Mode (IndexedDB)</span>
                <span className="text-[10px] text-rose-600">Queued</span>
              </button>
              <div className="mt-2 border-t border-slate-100 pt-1.5 dark:border-slate-800">
                <button
                  onClick={() => {
                    triggerManualSync();
                    setShowNetworkMenu(false);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Force Re-sync Devices</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pomodoro Quick Widget */}
        <div className="relative">
          <button
            onClick={() => setShowPomodoroMini(!showPomodoroMini)}
            title="Pomodoro Focus Timer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Timer className={`h-3.5 w-3.5 ${pomodoro.isRunning ? 'text-indigo-500 animate-spin' : 'text-slate-400'}`} />
            <span className="tabular-nums">{formatTimer(pomodoro.timeLeft)}</span>
          </button>

          {showPomodoroMini && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white capitalize">
                  {pomodoro.mode.replace('_', ' ')} Session
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Cycles: {pomodoro.completedCycles}
                </span>
              </div>
              <div className="my-3 text-center">
                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-wider">
                  {formatTimer(pomodoro.timeLeft)}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                {pomodoro.isRunning ? (
                  <button
                    onClick={pausePomodoro}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition"
                  >
                    <Pause className="h-3 w-3" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startPomodoro()}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition"
                  >
                    <Play className="h-3 w-3" />
                    <span>Start Focus</span>
                  </button>
                )}
                <button
                  onClick={resetPomodoro}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lock Vault Button */}
        <button
          onClick={() => {
            lockApp();
            setIsBiometricModalOpen(true);
          }}
          title="Lock Vault with Biometrics / PIN (Ctrl+L)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Lock className="h-4 w-4" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => setActiveTab('analytics')}
          title="Notifications & Reports"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Shortcuts & Guide Help */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          title="Keyboard Shortcuts & Guide (?)"
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:flex"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Team Role & Member Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowMemberDropdown(!showMemberDropdown)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 p-1 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            <img
              src={currentMember.avatar}
              alt={currentMember.name}
              className="h-6 w-6 rounded-md object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="hidden text-xs font-medium text-slate-700 dark:text-slate-300 xl:inline">
              {currentMember.name}
            </span>
          </button>

          {showMemberDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-2 py-1.5 pb-2 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Active Identity</div>
                <div className="text-[11px] text-slate-500">Simulate RBAC role permissions</div>
              </div>
              <div className="mt-1 space-y-1">
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentMember(m);
                      setShowMemberDropdown(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      currentMember.id === m.id
                        ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-6 w-6 rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 truncate">
                      <div className="truncate font-medium">{m.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{m.role} role</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA: New Task */}
        {permissions.canCreateTask && (
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        )}
      </div>
    </header>
  );
};
