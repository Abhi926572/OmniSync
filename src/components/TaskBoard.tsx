import React from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  Lock,
  Play,
  MoreVertical,
  Calendar,
  AlertTriangle,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'backlog', label: 'Backlog', dotColor: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'bg-indigo-500' },
  { id: 'in_review', label: 'In Review', dotColor: 'bg-amber-500' },
  { id: 'done', label: 'Completed', dotColor: 'bg-emerald-500' },
];

export const TaskBoard: React.FC = () => {
  const {
    filteredTasks,
    categories,
    updateTask,
    setEditingTask,
    setIsTaskModalOpen,
    startPomodoro,
    setInspectingTask,
    setIsCryptoInspectorOpen,
    permissions,
    pomodoro,
  } = useApp();

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return { label: 'P0 Urgent', class: 'text-rose-600 dark:text-rose-400' };
      case 'high':
        return { label: 'P1 High', class: 'text-amber-600 dark:text-amber-400' };
      case 'medium':
        return { label: 'P2 Medium', class: 'text-blue-600 dark:text-blue-400' };
      case 'low':
        return { label: 'P3 Low', class: 'text-slate-500 dark:text-slate-400' };
    }
  };

  const handleNextStatus = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const order: TaskStatus[] = ['backlog', 'in_progress', 'in_review', 'done'];
    const curIdx = order.indexOf(task.status);
    const nextStatus = order[(curIdx + 1) % order.length];
    await updateTask(task.id, { status: nextStatus });
  };

  const handleOpenCryptoInspector = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setInspectingTask(task);
    setIsCryptoInspectorOpen(true);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
      {COLUMNS.map((col) => {
        const columnTasks = filteredTasks.filter((t) => t.status === col.id);
        const totalMinutes = columnTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
        const hours = (totalMinutes / 60).toFixed(1);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl border border-slate-200/80 bg-slate-100/50 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/40"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {col.label}
                </h3>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'} · {hours}h
              </div>
            </div>

            {/* Task Cards List */}
            <div className="flex flex-col gap-2.5 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
                  No tasks in this lane
                </div>
              ) : (
                columnTasks.map((task) => {
                  const category = getCategory(task.categoryId);
                  const priority = getPriorityStyle(task.priority);
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                  const isOverdue =
                    task.status !== 'done' &&
                    task.dueDate &&
                    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

                  const isTaskPomodoroActive = pomodoro.activeTaskId === task.id && pomodoro.isRunning;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="group relative cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                    >
                      {/* Top metadata line: Unboxed category & E2EE badge */}
                      <div className="mb-1.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          {category && (
                            <>
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">{category.name}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span className={`font-medium ${priority.class}`}>{priority.label}</span>
                        </div>

                        {/* E2EE Lock Button (Inspect AES-GCM Ciphertext) */}
                        {task.isEncrypted && (
                          <button
                            onClick={(e) => handleOpenCryptoInspector(task, e)}
                            title="AES-256 Encrypted: Click to inspect zero-knowledge ciphertext payload"
                            className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <Lock className="h-3 w-3" />
                            <span className="font-mono">E2EE</span>
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Subtasks</span>
                            <span className="font-mono tabular-nums">
                              {completedSubtasks}/{task.subtasks.length}
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full bg-indigo-500 transition-all"
                              style={{
                                width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Card Footer: Due date, Pomodoro, Next lane */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`h-3 w-3 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span className={isOverdue ? 'font-medium text-rose-600 dark:text-rose-400' : ''}>
                            {task.dueDate || 'No date'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Pomodoro Focus session trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startPomodoro(task.id);
                            }}
                            title="Start 25m Focus Session on this task"
                            className={`flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                              isTaskPomodoroActive ? 'text-indigo-600 animate-pulse' : 'text-slate-400'
                            }`}
                          >
                            <Play className="h-3 w-3" />
                          </button>

                          {/* Advance Status Button */}
                          {permissions.canEditTask && (
                            <button
                              onClick={(e) => handleNextStatus(task, e)}
                              title="Move to next column"
                              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
