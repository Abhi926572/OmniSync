import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Folder,
  Tag,
  Search,
  SlidersHorizontal,
  Sun,
  Moon,
  Contrast,
  ShieldCheck,
  HardDrive,
  Plus,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    tasks,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    searchQuery,
    setSearchQuery,
    settings,
    updateSettings,
    createCategory,
  } = useApp();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');

  // Compute category counts
  const categoryCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] = tasks.filter((t) => t.categoryId === cat.id).length;
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await createCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Folder',
      description: 'Custom user category',
    });
    setNewCatName('');
    setIsAddingCategory(false);
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 md:flex">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, tags..."
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Categories & Projects */}
      <div className="mb-6 flex-1 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Categories & Projects</span>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Add Category"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* All tasks filter */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            selectedCategory === null
              ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Folder className="h-3.5 w-3.5 text-slate-400" />
            <span>All Projects</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
            {completedTasks}/{totalTasks}
          </span>
        </button>

        {/* Dynamic Category List */}
        <div className="mt-1 space-y-0.5">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Category Form Modal */}
        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} className="mt-2 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              autoFocus
              className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {['#3B82F6', '#10B981', '#A855F7', '#F59E0B', '#EC4899', '#6366F1'].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className={`h-4 w-4 rounded-full transition-transform ${newCatColor === c ? 'scale-125 ring-2 ring-indigo-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="rounded px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Priority Filter */}
        <div className="mt-6 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Priority Levels
        </div>
        <div className="space-y-0.5">
          {[
            { id: 'urgent', label: 'Urgent (P0)', color: 'text-rose-500' },
            { id: 'high', label: 'High (P1)', color: 'text-amber-500' },
            { id: 'medium', label: 'Medium (P2)', color: 'text-blue-500' },
            { id: 'low', label: 'Low (P3)', color: 'text-slate-400' },
          ].map((p) => {
            const isSelected = selectedPriority === p.id;
            const count = tasks.filter((t) => t.priority === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPriority(isSelected ? null : p.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${p.color}`}>●</span>
                  <span>{p.label}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Integrity & Storage Summary Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Vault Security</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            AES-256
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Zero-knowledge client encryption active. Offline-first IndexedDB buffer synced.
        </div>

        {/* Theme mode segmented selector */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`flex items-center justify-center rounded-md py-1 text-xs transition ${
              settings.theme === 'light'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
            title="Light Theme"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`flex items-center justify-center rounded-md py-1 text-xs transition ${
              settings.theme === 'dark'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
            title="Dark Theme"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => updateSettings({ theme: 'high-contrast' })}
            className={`flex items-center justify-center rounded-md py-1 text-xs transition ${
              settings.theme === 'high-contrast'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
            title="OLED High Contrast"
          >
            <Contrast className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
