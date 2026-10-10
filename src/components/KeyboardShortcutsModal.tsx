import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Command } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useApp();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create new task (when permitted)' },
    { key: 'L', desc: 'Immediately lock vault with biometrics' },
    { key: 'S', desc: 'Trigger manual peer synchronization' },
    { key: 'D', desc: 'Cycle theme (Dark / Light / High-Contrast)' },
    { key: '?', desc: 'Toggle keyboard shortcuts cheatsheet' },
    { key: 'Esc', desc: 'Close any open modal or overlay' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Keyboard Shortcuts Cheatsheet
            </h3>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="rounded p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-100 text-xs dark:divide-slate-800">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2">
              <span className="text-slate-600 dark:text-slate-400">{s.desc}</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
