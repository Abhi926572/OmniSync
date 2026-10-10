import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  FileText,
  ShieldAlert,
  Clock,
  TrendingUp,
  CheckCircle,
  BarChart,
  Calendar,
  Lock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { encryptData } from '../services/crypto';

export const Dashboard: React.FC = () => {
  const { tasks, categories, permissions, addNotification } = useApp();

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Compute metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalMinutes = tasks.reduce((sum, t) => sum + (t.elapsedMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const encryptedTasksCount = tasks.filter((t) => t.isEncrypted).length;
  const encryptionPercentage = totalTasks > 0 ? Math.round((encryptedTasksCount / totalTasks) * 100) : 100;

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const count = catTasks.length;
    const completed = catTasks.filter((t) => t.status === 'done').length;
    const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      count,
      completed,
      percentage,
    };
  });

  // 7-day velocity data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const velocityData = [
    { day: 'Mon', completed: 4, created: 3 },
    { day: 'Tue', completed: 6, created: 5 },
    { day: 'Wed', completed: 5, created: 2 },
    { day: 'Thu', completed: 8, created: 7 },
    { day: 'Fri', completed: 7, created: 4 },
    { day: 'Sat', completed: 3, created: 1 },
    { day: 'Sun', completed: 2, created: 2 },
  ];

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Due Date', 'Est Min', 'Elapsed Min', 'Encrypted'];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      categories.find((c) => c.id === t.categoryId)?.name || t.categoryId,
      t.priority,
      t.status,
      t.dueDate,
      t.estimatedMinutes,
      t.elapsedMinutes,
      t.isEncrypted ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniSync_Tasks_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice('CSV dataset downloaded successfully');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `OmniSync_Backup_${Date.now()}.json`);
    downloadAnchor.click();

    setExportNotice('JSON database downloaded successfully');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportEncryptedVault = async () => {
    try {
      const payload = await encryptData({
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
        categories,
      });

      const vaultStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', vaultStr);
      downloadAnchor.setAttribute('download', `OmniSync_Encrypted_Vault_${Date.now()}.cipher`);
      downloadAnchor.click();

      setExportNotice('Zero-knowledge AES-256 encrypted vault exported');
      setTimeout(() => setExportNotice(null), 3000);
    } catch {
      setExportNotice('Failed to generate encrypted vault');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Productivity Intelligence & Metrics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time analytics, focus logs, and zero-knowledge data export
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canExportData && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleExportEncryptedVault}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-500"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Encrypted Vault (.cipher)</span>
              </button>
            </>
          )}
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* KPI Cards Strip (Single level elevation, tabular numerals) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completion Rate</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({doneTasks}/{totalTasks})
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Focus Time Logged</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {totalHours}h
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({totalMinutes} mins)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across 5 active team members
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>7-Day Velocity</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              +33
            </span>
            <span className="text-xs text-emerald-600 font-medium font-mono">
              +14% vs last wk
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Average 4.7 tasks resolved / day
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Vault E2EE Coverage</span>
            <Lock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {encryptionPercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-mono">
              AES-256-GCM
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            PBKDF2 100k Key Derivation
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Velocity Chart (Interactive SVG Bars) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Task Velocity Trend (Last 7 Days)
              </h3>
              <p className="text-[11px] text-slate-500">Completed vs Created throughput</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-xs bg-indigo-500" /> Completed
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-xs bg-slate-300 dark:bg-slate-700" /> Created
              </span>
            </div>
          </div>

          <div className="flex h-48 items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2 dark:border-slate-800">
            {velocityData.map((d, i) => {
              const maxVal = 10;
              const completedHeight = (d.completed / maxVal) * 100;
              const createdHeight = (d.created / maxVal) * 100;

              return (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-1.5 h-36">
                    <div
                      title={`Completed: ${d.completed}`}
                      className="w-3 rounded-t-xs bg-indigo-500 transition-all hover:bg-indigo-400"
                      style={{ height: `${completedHeight}%` }}
                    />
                    <div
                      title={`Created: ${d.created}`}
                      className="w-3 rounded-t-xs bg-slate-200 dark:bg-slate-700 transition-all hover:bg-slate-300"
                      style={{ height: `${createdHeight}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category & Project Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Category Distribution & Allocation
            </h3>
            <p className="text-[11px] text-slate-500">Task breakdown by project domain</p>
          </div>

          <div className="space-y-3">
            {categoryStats.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-500 tabular-nums text-[11px]">
                    <span>{c.count} tasks</span>
                    <span>·</span>
                    <span>{c.percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productivity Heatmap (52-Week activity contribution grid) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Sync & Productivity Activity Heatmap
            </h3>
            <p className="text-[11px] text-slate-500">
              Contribution and synchronization density over recent cycles
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-950" />
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-400 dark:bg-indigo-700" />
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[640px]">
            {Array.from({ length: 52 * 7 }).map((_, idx) => {
              // Deterministic pseudo-random contribution intensity
              const intensity = (idx * 17 + 23) % 5;
              let bgClass = 'bg-slate-100 dark:bg-slate-800';
              if (intensity === 1) bgClass = 'bg-indigo-100 dark:bg-indigo-950/60';
              if (intensity === 2) bgClass = 'bg-indigo-300 dark:bg-indigo-800/80';
              if (intensity === 3) bgClass = 'bg-indigo-500 dark:bg-indigo-600';
              if (intensity === 4) bgClass = 'bg-indigo-600 dark:bg-indigo-500';

              return (
                <div
                  key={idx}
                  title={`Day ${idx + 1}: ${intensity * 2} updates recorded`}
                  className={`h-2.5 w-2.5 rounded-xs ${bgClass} transition-colors hover:ring-1 hover:ring-indigo-400`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
