import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { TaskBoard } from './components/TaskBoard';
import { TaskList } from './components/TaskList';
import { TaskMatrix } from './components/TaskMatrix';
import { Dashboard } from './components/Dashboard';
import { TeamCollaboration } from './components/TeamCollaboration';
import { SecurityCenter } from './components/SecurityCenter';
import { DeviceManagerView } from './components/DeviceManagerView';
import { DeviceSimulator } from './components/DeviceSimulator';
import { TaskModal } from './components/TaskModal';
import { BiometricModal } from './components/BiometricModal';
import { CryptoInspectorModal } from './components/CryptoInspectorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import {
  Kanban,
  List,
  Filter,
  WifiOff,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    viewMode,
    setViewMode,
    networkCondition,
    tasks,
    selectedCategory,
    categories,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    permissions,
    setIsTaskModalOpen,
    setEditingTask,
  } = useApp();

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden">
      {/* Offline Mode Banner */}
      {networkCondition === 'offline' && (
        <div className="flex items-center justify-center gap-2 bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline Mode Active — Changes safely saved in IndexedDB and queued for sync</span>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Body Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl">
            {/* Contextual Toolbar for Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeCategory ? activeCategory.name : 'Workspace Tasks'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {activeCategory ? activeCategory.description : 'All prioritized projects and tasks across devices'}
                  </p>
                </div>

                {/* View switcher & Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        viewMode === 'kanban'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <Kanban className="h-3.5 w-3.5" />
                      <span>Board</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        viewMode === 'list'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>List</span>
                    </button>
                  </div>

                  {permissions.canCreateTask && (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Render Current Tab Component */}
            {activeTab === 'tasks' && (viewMode === 'kanban' ? <TaskBoard /> : <TaskList />)}
            {activeTab === 'matrix' && <TaskMatrix />}
            {activeTab === 'analytics' && <Dashboard />}
            {activeTab === 'team' && <TeamCollaboration />}
            {activeTab === 'security' && <SecurityCenter />}
            {activeTab === 'devices' && <DeviceManagerView />}
          </div>
        </main>
      </div>

      {/* Mobile Navigation Thumb Bar */}
      <MobileNav />

      {/* Global Modals & Overlays */}
      <TaskModal />
      <BiometricModal />
      <CryptoInspectorModal />
      <OnboardingModal />
      <KeyboardShortcutsModal />
      <PWAInstallBanner />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DeviceSimulator>
        <MainLayout />
      </DeviceSimulator>
    </AppProvider>
  );
}
