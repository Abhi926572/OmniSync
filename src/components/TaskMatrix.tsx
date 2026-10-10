import React from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import {
  Flame,
  CalendarClock,
  UserCheck,
  Archive,
  Lock,
  CheckCircle2,
  Circle,
  Plus,
} from 'lucide-react';

export const TaskMatrix: React.FC = () => {
  const {
    filteredTasks,
    categories,
    toggleTaskComplete,
    setEditingTask,
    setIsTaskModalOpen,
    permissions,
  } = useApp();

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  // Categorize tasks into the 4 Eisenhower Quadrants
  // Q1: Urgent (P0) or Due Today/Overdue
  // Q2: High (P1) or Medium (P2) with due date
  // Q3: Low priority or delegation
  // Q4: Backlog / Low
  const now = new Date().setHours(0, 0, 0, 0);

  const q1Tasks = filteredTasks.filter(
    (t) => t.priority === 'urgent' || (t.dueDate && new Date(t.dueDate).getTime() <= now)
  );

  const q2Tasks = filteredTasks.filter(
    (t) =>
      t.priority === 'high' &&
      !q1Tasks.some((x) => x.id === t.id)
  );

  const q3Tasks = filteredTasks.filter(
    (t) =>
      t.priority === 'medium' &&
      !q1Tasks.some((x) => x.id === t.id) &&
      !q2Tasks.some((x) => x.id === t.id)
  );

  const q4Tasks = filteredTasks.filter(
    (t) =>
      t.priority === 'low' ||
      (!q1Tasks.some((x) => x.id === t.id) &&
        !q2Tasks.some((x) => x.id === t.id) &&
        !q3Tasks.some((x) => x.id === t.id))
  );

  const renderQuadrant = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    tasks: Task[],
    borderHighlight: string,
    headerBg: string
  ) => {
    return (
      <div className={`flex flex-col rounded-xl border ${borderHighlight} bg-white p-4 shadow-xs dark:bg-slate-900`}>
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${headerBg} mb-3`}>
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {tasks.length}
          </span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto max-h-72">
          {tasks.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
              No tasks in this quadrant
            </div>
          ) : (
            tasks.map((task) => {
              const category = getCategory(task.categoryId);
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer"
                >
                  <div className="flex items-start gap-2 truncate">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-500"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <div className="truncate">
                      <div className={`truncate font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                        {category && <span>{category.name}</span>}
                        {task.dueDate && <span>· Due {task.dueDate}</span>}
                      </div>
                    </div>
                  </div>

                  {task.isEncrypted && (
                    <Lock className="h-3 w-3 shrink-0 text-emerald-500 mt-1" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Eisenhower Decision Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Strategic urgency vs importance distribution for optimal time allocation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {renderQuadrant(
          'Q1: Do First (Urgent & Important)',
          'Crises, deadlines, pressing problems',
          <Flame className="h-4 w-4 text-rose-500" />,
          q1Tasks,
          'border-rose-200 dark:border-rose-900/50',
          'bg-rose-50 dark:bg-rose-950/30'
        )}

        {renderQuadrant(
          'Q2: Schedule (Not Urgent, Important)',
          'Planning, deep work, system improvements',
          <CalendarClock className="h-4 w-4 text-indigo-500" />,
          q2Tasks,
          'border-indigo-200 dark:border-indigo-900/50',
          'bg-indigo-50 dark:bg-indigo-950/30'
        )}

        {renderQuadrant(
          'Q3: Delegate (Urgent, Not Important)',
          'Interruptions, urgent meetings, minor requests',
          <UserCheck className="h-4 w-4 text-amber-500" />,
          q3Tasks,
          'border-amber-200 dark:border-amber-900/50',
          'bg-amber-50 dark:bg-amber-950/30'
        )}

        {renderQuadrant(
          'Q4: Eliminate (Neither Urgent Nor Important)',
          'Time wasters, busywork, obsolete tasks',
          <Archive className="h-4 w-4 text-slate-400" />,
          q4Tasks,
          'border-slate-200 dark:border-slate-800',
          'bg-slate-50 dark:bg-slate-800/40'
        )}
      </div>
    </div>
  );
};
