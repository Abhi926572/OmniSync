import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus, Subtask } from '../types';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    setEditingTask,
    categories,
    teamMembers,
    createTask,
    updateTask,
    deleteTask,
    permissions,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('in_progress');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [assignedMemberId, setAssignedMemberId] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategoryId(editingTask.categoryId || (categories[0]?.id ?? ''));
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setDueDate(editingTask.dueDate || '');
      setEstimatedMinutes(editingTask.estimatedMinutes || 60);
      setElapsedMinutes(editingTask.elapsedMinutes || 0);
      setAssignedMemberId(editingTask.assignedMemberId || (teamMembers[0]?.id ?? ''));
      setIsEncrypted(editingTask.isEncrypted);
      setTagsInput(editingTask.tags.join(', '));
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPriority('medium');
      setStatus('in_progress');
      setDueDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
      setEstimatedMinutes(60);
      setElapsedMinutes(0);
      setAssignedMemberId(teamMembers[0]?.id || '');
      setIsEncrypted(true);
      setTagsInput('');
      setSubtasks([]);
    }
  }, [editingTask, categories, teamMembers, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId || categories[0]?.id || 'eng',
      priority,
      status,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      elapsedMinutes: Number(elapsedMinutes) || 0,
      tags,
      subtasks,
      assignedMemberId: assignedMemberId || teamMembers[0]?.id || 'mem_1',
      isEncrypted,
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskPayload);
    } else {
      await createTask(taskPayload);
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = async () => {
    if (editingTask && permissions.canDeleteTask) {
      await deleteTask(editingTask.id);
      setIsTaskModalOpen(false);
      setEditingTask(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingTask ? 'Edit Task Details' : 'Create New Task'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Synced across all devices with client-side encryption
            </p>
          </div>
          <button
            onClick={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit Zero-Knowledge PBKDF2 Key Derivation"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical specifications, context, or acceptance criteria..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Project Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Status Lane
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          {/* Priority Segmented Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'urgent', label: 'P0 Urgent', activeBg: 'bg-rose-500 text-white' },
                  { id: 'high', label: 'P1 High', activeBg: 'bg-amber-500 text-white' },
                  { id: 'medium', label: 'P2 Medium', activeBg: 'bg-blue-500 text-white' },
                  { id: 'low', label: 'P3 Low', activeBg: 'bg-slate-600 text-white' },
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition ${
                    priority === p.id
                      ? p.activeBg
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Estimates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
              </input>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Estimate (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Logged (min)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={elapsedMinutes}
                onChange={(e) => setElapsedMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Assignee & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Assignee
              </label>
              <select
                value={assignedMemberId}
                onChange={(e) => setAssignedMemberId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="PWA, Crypto, API"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Subtasks Checklist
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                >
                  <label className="flex items-center gap-2 cursor-pointer truncate">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                    />
                    <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add new subtask item..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* End-to-End Encryption Security Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-950 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  AES-256-GCM End-to-End Encryption
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Encrypt payload client-side before sync transmission
                </div>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:outline-hidden dark:bg-slate-700"></div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {editingTask && permissions.canDeleteTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Task</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setEditingTask(null);
                }}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 shadow-xs"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
