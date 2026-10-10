import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Grid2X2,
  BarChart2,
  Users,
  Shield,
  Plus,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    permissions,
    setIsTaskModalOpen,
    setEditingTask,
  } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      <button
        onClick={() => setActiveTab('tasks')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
          activeTab === 'tasks'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <CheckSquare className="h-4 w-4" />
        <span>Tasks</span>
      </button>

      <button
        onClick={() => setActiveTab('matrix')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
          activeTab === 'matrix'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Grid2X2 className="h-4 w-4" />
        <span>Matrix</span>
      </button>

      {/* Primary Floating Action Thumb Target (44px) */}
      {permissions.canCreateTask && (
        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95"
          aria-label="Create New Task"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <button
        onClick={() => setActiveTab('analytics')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
          activeTab === 'analytics'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <BarChart2 className="h-4 w-4" />
        <span>Metrics</span>
      </button>

      <button
        onClick={() => setActiveTab('security')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
          activeTab === 'security'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Shield className="h-4 w-4" />
        <span>Vault</span>
      </button>
    </nav>
  );
};
