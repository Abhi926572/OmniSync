import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import {
  CheckCircle2,
  Circle,
  Lock,
  Calendar,
  Clock,
  Trash2,
  CheckCheck,
  ChevronDown,
  ArrowUpDown,
  Tag,
  Play,
} from 'lucide-react';

export const TaskList: React.FC = () => {
  const {
    filteredTasks,
    categories,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    setEditingTask,
    setIsTaskModalOpen,
    setInspectingTask,
    setIsCryptoInspectorOpen,
    startPomodoro,
    permissions,
  } = useApp();

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'title' | 'status'>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const toggleSelectTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleBatchMarkDone = async () => {
    for (const id of selectedTaskIds) {
      await updateTask(id, { status: 'done' });
    }
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = async () => {
    for (const id of selectedTaskIds) {
      await deleteTask(id);
    }
    setSelectedTaskIds([]);
  };

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'dueDate') {
      comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'priority') {
      const pOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      comparison = pOrder[a.priority] - pOrder[b.priority];
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Batch Actions Toolbar (if any selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/80 px-4 py-2 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/40">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
            <span>{selectedTaskIds.length} tasks selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchMarkDone}
              className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Mark Done</span>
            </button>
            {permissions.canDeleteTask && (
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50/75 px-4 py-2.5 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
        <div className="col-span-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedTaskIds.length > 0 && selectedTaskIds.length === filteredTasks.length}
            onChange={handleSelectAll}
            className="rounded border-slate-300 text-indigo-600 focus:ring-0"
          />
        </div>
        <div
          onClick={() => {
            if (sortField === 'title') setSortAsc(!sortAsc);
            else {
              setSortField('title');
              setSortAsc(true);
            }
          }}
          className="col-span-5 flex cursor-pointer items-center gap-1 hover:text-slate-900 dark:hover:text-white"
        >
          <span>Task Title & Details</span>
          <ArrowUpDown className="h-3 w-3" />
        </div>
        <div className="col-span-2 hidden sm:block">Category</div>
        <div
          onClick={() => {
            if (sortField === 'priority') setSortAsc(!sortAsc);
            else {
              setSortField('priority');
              setSortAsc(true);
            }
          }}
          className="col-span-2 flex cursor-pointer items-center gap-1 hover:text-slate-900 dark:hover:text-white"
        >
          <span>Priority</span>
          <ArrowUpDown className="h-3 w-3" />
        </div>
        <div
          onClick={() => {
            if (sortField === 'dueDate') setSortAsc(!sortAsc);
            else {
              setSortField('dueDate');
              setSortAsc(true);
            }
          }}
          className="col-span-2 flex cursor-pointer items-center justify-end gap-1 text-right hover:text-slate-900 dark:hover:text-white"
        >
          <span>Due Date</span>
          <ArrowUpDown className="h-3 w-3" />
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {sortedTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No matching tasks found.
          </div>
        ) : (
          sortedTasks.map((task) => {
            const category = getCategory(task.categoryId);
            const isSelected = selectedTaskIds.includes(task.id);
            const isOverdue =
              task.status !== 'done' &&
              task.dueDate &&
              new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={task.id}
                onClick={() => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                className={`grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-xs transition cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                  isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                }`}
              >
                {/* Select & Complete check */}
                <div className="col-span-1 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => toggleSelectTask(task.id, e)}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className="text-slate-400 hover:text-emerald-500 transition"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Title & E2EE tag */}
                <div className="col-span-5 flex items-center gap-2 truncate">
                  <span
                    className={`truncate font-medium text-slate-900 dark:text-white ${
                      task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.isEncrypted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingTask(task);
                        setIsCryptoInspectorOpen(true);
                      }}
                      title="AES-256 E2EE Protected"
                      className="text-emerald-600 dark:text-emerald-400"
                    >
                      <Lock className="h-3 w-3" />
                    </button>
                  )}
                  {task.subtasks.length > 0 && (
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                      {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="col-span-2 hidden truncate sm:flex items-center gap-1.5 text-slate-500">
                  {category && (
                    <>
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate text-[11px]">{category.name}</span>
                    </>
                  )}
                </div>

                {/* Priority */}
                <div className="col-span-2 text-[11px]">
                  <span
                    className={`font-medium ${
                      task.priority === 'urgent'
                        ? 'text-rose-600 dark:text-rose-400'
                        : task.priority === 'high'
                        ? 'text-amber-600 dark:text-amber-400'
                        : task.priority === 'medium'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {/* Due Date & Pomodoro */}
                <div className="col-span-2 flex items-center justify-end gap-2 text-right font-mono text-[11px] tabular-nums text-slate-500">
                  <span className={isOverdue ? 'font-medium text-rose-600 dark:text-rose-400' : ''}>
                    {task.dueDate || '—'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startPomodoro(task.id);
                    }}
                    title="Focus on task"
                    className="p-1 text-slate-400 hover:text-indigo-600"
                  >
                    <Play className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
