import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  Category,
  TeamMember,
  UserSettings,
  AppNotification,
  ActiveTab,
  TaskViewMode,
  DeviceFrameMode,
  NetworkCondition,
  SyncState,
  PairedDevice,
  RolePermissions,
  EncryptedPayload,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MEMBERS,
  INITIAL_TASKS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { localDB } from '../services/storage';
import { syncEngine, INITIAL_DEVICES } from '../services/syncEngine';
import { notificationService } from '../services/notifications';
import { encryptData, decryptData } from '../services/crypto';

interface AppContextType {
  // Navigation & View State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewMode: TaskViewMode;
  setViewMode: (mode: TaskViewMode) => void;
  deviceFrame: DeviceFrameMode;
  setDeviceFrame: (mode: DeviceFrameMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedPriority: string | null;
  setSelectedPriority: (p: string | null) => void;

  // Tasks & Categories
  tasks: Task[];
  filteredTasks: Task[];
  categories: Category[];
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncRevision'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;

  // Categories CRUD
  createCategory: (cat: Omit<Category, 'id'>) => Promise<void>;

  // Team & Permissions
  currentMember: TeamMember;
  setCurrentMember: (member: TeamMember) => void;
  teamMembers: TeamMember[];
  updateMemberRole: (memberId: string, role: TeamMember['role']) => void;
  permissions: RolePermissions;

  // Devices & Sync
  devices: PairedDevice[];
  syncState: SyncState;
  networkCondition: NetworkCondition;
  setNetworkCondition: (condition: NetworkCondition) => void;
  triggerManualSync: () => Promise<void>;
  lastSyncedTimestamp: number;

  // Biometrics & Security Lock
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  isBiometricModalOpen: boolean;
  setIsBiometricModalOpen: (open: boolean) => void;
  verifyBiometrics: () => Promise<boolean>;

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Pomodoro Timer
  pomodoro: {
    isRunning: boolean;
    timeLeft: number;
    mode: 'focus' | 'short_break' | 'long_break';
    activeTaskId: string | null;
    completedCycles: number;
  };
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  setPomodoroTask: (taskId: string | null) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // E2E Crypto Inspector
  inspectCryptoPayload: (task: Task) => Promise<EncryptedPayload>;
  isCryptoInspectorOpen: boolean;
  setIsCryptoInspectorOpen: (open: boolean) => void;
  inspectingTask: Task | null;
  setInspectingTask: (task: Task | null) => void;

  // Onboarding & Help
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Layout
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameMode>('native');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  // Core Data
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [currentMember, setCurrentMember] = useState<TeamMember>(INITIAL_MEMBERS[0]);
  const [devices, setDevices] = useState<PairedDevice[]>(INITIAL_DEVICES);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals & Inspection
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isCryptoInspectorOpen, setIsCryptoInspectorOpen] = useState(false);
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Lock State
  const [isLocked, setIsLocked] = useState(false);

  // Sync Engine State
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [networkCondition, setNetworkConditionState] = useState<NetworkCondition>('online');
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<number>(Date.now());

  // Pomodoro Focus Timer State
  const [pomodoro, setPomodoro] = useState<{
    isRunning: boolean;
    timeLeft: number;
    mode: 'focus' | 'short_break' | 'long_break';
    activeTaskId: string | null;
    completedCycles: number;
  }>({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'focus',
    activeTaskId: null,
    completedCycles: 0,
  });

  // Load persistent data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedTasks = await localDB.getAll<Task>('tasks');
        if (storedTasks && storedTasks.length > 0) {
          setTasks(storedTasks);
        } else {
          await localDB.putBatch('tasks', INITIAL_TASKS);
        }

        const storedCats = await localDB.getAll<Category>('categories');
        if (storedCats && storedCats.length > 0) {
          setCategories(storedCats);
        } else {
          await localDB.putBatch('categories', INITIAL_CATEGORIES);
        }

        const storedSettings = await localDB.getAll<UserSettings & { id: string }>('settings');
        if (storedSettings && storedSettings.length > 0) {
          setSettings(storedSettings[0]);
        }

        // Check if first-time user for onboarding
        const hasSeenTour = localStorage.getItem('omnisync_tour_completed');
        if (!hasSeenTour) {
          setIsOnboardingOpen(true);
        }
      } catch (err) {
        console.warn('Initial storage load issue', err);
      }
    }
    loadData();
  }, []);

  // Listen to cross-tab / cross-device broadcast channel
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((event) => {
      if (event.type === 'mutation') {
        const mut = event.payload;
        if (mut.entity === 'task') {
          if (mut.type === 'create' || mut.type === 'update') {
            setTasks((prev) => {
              const idx = prev.findIndex((t) => t.id === mut.payload.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = mut.payload;
                return next;
              }
              return [mut.payload, ...prev];
            });
          } else if (mut.type === 'delete') {
            setTasks((prev) => prev.filter((t) => t.id !== mut.entityId));
          }
        }
        setLastSyncedTimestamp(Date.now());
        if (settings.soundEnabled) {
          notificationService.playChime('click');
        }
      }
    });

    return () => unsubscribe();
  }, [settings.soundEnabled]);

  // Apply Theme & Font Scale to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-high-contrast');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'high-contrast') {
      root.classList.add('dark', 'theme-high-contrast');
    }

    root.style.setProperty('--app-font-scale', `${settings.fontScale}%`);
  }, [settings.theme, settings.fontScale]);

  // Network condition updater
  const setNetworkCondition = useCallback((condition: NetworkCondition) => {
    setNetworkConditionState(condition);
    syncEngine.setNetworkCondition(condition);
    setSyncState(syncEngine.getSyncState());

    if (settings.hapticFeedback) {
      notificationService.triggerHaptic(25);
    }
  }, [settings.hapticFeedback]);

  // Pomodoro countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (pomodoro.isRunning && pomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoro((prev) => {
          if (prev.timeLeft <= 1) {
            // Pomodoro complete!
            if (settings.soundEnabled) {
              notificationService.playChime('complete');
            }
            if (settings.hapticFeedback) {
              notificationService.triggerHaptic(60);
            }
            // If linked to active task, increment elapsed minutes by 25
            if (prev.activeTaskId) {
              setTasks((allTasks) =>
                allTasks.map((t) =>
                  t.id === prev.activeTaskId
                    ? { ...t, elapsedMinutes: t.elapsedMinutes + (prev.mode === 'focus' ? 25 : 0) }
                    : t
                )
              );
            }
            notificationService.sendPushNotification('Pomodoro Session Completed!', {
              body: prev.mode === 'focus' ? 'Great focus! Time for a short break.' : 'Break over, ready to focus!',
            });
            const nextMode = prev.mode === 'focus' ? 'short_break' : 'focus';
            const nextTime = nextMode === 'focus' ? 25 * 60 : 5 * 60;
            return {
              ...prev,
              isRunning: false,
              timeLeft: nextTime,
              mode: nextMode,
              completedCycles: prev.mode === 'focus' ? prev.completedCycles + 1 : prev.completedCycles,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoro.isRunning, pomodoro.timeLeft, pomodoro.mode, pomodoro.activeTaskId, settings]);

  // Pomodoro actions
  const startPomodoro = useCallback((taskId?: string) => {
    setPomodoro((prev) => ({
      ...prev,
      isRunning: true,
      activeTaskId: taskId !== undefined ? taskId : prev.activeTaskId,
    }));
    if (settings.hapticFeedback) notificationService.triggerHaptic(15);
  }, [settings.hapticFeedback]);

  const pausePomodoro = useCallback(() => {
    setPomodoro((prev) => ({ ...prev, isRunning: false }));
    if (settings.hapticFeedback) notificationService.triggerHaptic(15);
  }, [settings.hapticFeedback]);

  const resetPomodoro = useCallback(() => {
    setPomodoro((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === 'focus' ? 25 * 60 : prev.mode === 'short_break' ? 5 * 60 : 15 * 60,
    }));
  }, []);

  const setPomodoroTask = useCallback((taskId: string | null) => {
    setPomodoro((prev) => ({ ...prev, activeTaskId: taskId }));
  }, []);

  // Compute permissions for active role
  const permissions = useMemo<RolePermissions>(() => {
    const role = currentMember.role;
    if (role === 'owner') {
      return {
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canManageTeam: true,
        canExportData: true,
        canManageEncryption: true,
      };
    }
    if (role === 'admin') {
      return {
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canManageTeam: true,
        canExportData: true,
        canManageEncryption: false,
      };
    }
    if (role === 'editor') {
      return {
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: false,
        canManageTeam: false,
        canExportData: true,
        canManageEncryption: false,
      };
    }
    // viewer
    return {
      canCreateTask: false,
      canEditTask: false,
      canDeleteTask: false,
      canManageTeam: false,
      canExportData: false,
      canManageEncryption: false,
    };
  }, [currentMember.role]);

  // Task CRUD operations with real-time sync & persistence
  const createTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncRevision'>): Promise<Task> => {
      const newTask: Task = {
        ...taskData,
        id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncRevision: 1,
      };

      setTasks((prev) => [newTask, ...prev]);
      await localDB.put('tasks', newTask);

      await syncEngine.recordMutation({
        type: 'create',
        entity: 'task',
        entityId: newTask.id,
        payload: newTask,
      });

      setSyncState(syncEngine.getSyncState());
      setLastSyncedTimestamp(Date.now());

      if (settings.soundEnabled) notificationService.playChime('success');
      if (settings.hapticFeedback) notificationService.triggerHaptic(25);

      return newTask;
    },
    [settings]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      let updatedTask: Task | null = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            updatedTask = {
              ...t,
              ...updates,
              updatedAt: Date.now(),
              syncRevision: t.syncRevision + 1,
            };
            return updatedTask;
          }
          return t;
        })
      );

      if (updatedTask) {
        await localDB.put('tasks', updatedTask);
        await syncEngine.recordMutation({
          type: 'update',
          entity: 'task',
          entityId: id,
          payload: updatedTask,
        });
        setSyncState(syncEngine.getSyncState());
        setLastSyncedTimestamp(Date.now());
      }
    },
    []
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await localDB.delete('tasks', id);
      await syncEngine.recordMutation({
        type: 'delete',
        entity: 'task',
        entityId: id,
        payload: { id },
      });
      setSyncState(syncEngine.getSyncState());
      setLastSyncedTimestamp(Date.now());
      if (settings.soundEnabled) notificationService.playChime('alert');
      if (settings.hapticFeedback) notificationService.triggerHaptic(40);
    },
    [settings]
  );

  const toggleTaskComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const nextStatus = task.status === 'done' ? 'in_progress' : 'done';
      await updateTask(id, { status: nextStatus });
      if (nextStatus === 'done' && settings.soundEnabled) {
        notificationService.playChime('success');
      }
    },
    [tasks, updateTask, settings]
  );

  const createCategory = useCallback(
    async (cat: Omit<Category, 'id'>) => {
      const newCat: Category = {
        ...cat,
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      };
      setCategories((prev) => [...prev, newCat]);
      await localDB.put('categories', newCat);
      if (settings.soundEnabled) notificationService.playChime('success');
    },
    [settings]
  );

  const updateMemberRole = useCallback((memberId: string, role: TeamMember['role']) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
    if (currentMember.id === memberId) {
      setCurrentMember((prev) => ({ ...prev, role }));
    }
  }, [currentMember.id]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localDB.put('settings', { id: 'user_settings', ...next });
      return next;
    });
  }, []);

  const triggerManualSync = useCallback(async () => {
    setSyncState('syncing');
    const flushedCount = await syncEngine.flushPendingMutations();
    // Simulate low-latency sync pulse
    await new Promise((r) => setTimeout(r, 350));
    setSyncState('synced');
    setLastSyncedTimestamp(Date.now());
    setDevices((prev) =>
      prev.map((d) => (d.isCurrent ? { ...d, lastSyncAt: Date.now() } : d))
    );
    if (settings.soundEnabled) notificationService.playChime('success');
    if (settings.hapticFeedback) notificationService.triggerHaptic(20);
    return flushedCount as any;
  }, [settings]);

  // Lock & Biometrics
  const lockApp = useCallback(() => {
    setIsLocked(true);
    if (settings.hapticFeedback) notificationService.triggerHaptic(35);
  }, [settings.hapticFeedback]);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    if (settings.soundEnabled) notificationService.playChime('success');
    if (settings.hapticFeedback) notificationService.triggerHaptic(20);
  }, [settings]);

  const verifyBiometrics = useCallback(async (): Promise<boolean> => {
    // Attempt navigator.credentials WebAuthn first if available
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Feature check succeeded; simulated or real passkey challenge
      }
    } catch {
      // Fallback
    }
    // Simulate tactile biometric scan delay (600ms)
    await new Promise((r) => setTimeout(r, 600));
    unlockApp();
    return true;
  }, [unlockApp]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const full: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        timestamp: Date.now(),
        read: false,
      };
      setNotifications((prev) => [full, ...prev]);
      if (settings.pushNotifications) {
        notificationService.sendPushNotification(full.title, { body: full.message });
      }
      if (settings.soundEnabled) {
        notificationService.playChime('alert');
      }
    },
    [settings]
  );

  // E2E Crypto Inspector helper
  const inspectCryptoPayload = useCallback(async (task: Task): Promise<EncryptedPayload> => {
    return await encryptData(task);
  }, []);

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === null || task.categoryId === selectedCategory;

      const matchesPriority =
        selectedPriority === null || task.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        if (permissions.canCreateTask) {
          e.preventDefault();
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        lockApp();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setSettings((prev) => ({
          ...prev,
          theme: prev.theme === 'dark' ? 'light' : prev.theme === 'light' ? 'high-contrast' : 'dark',
        }));
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        triggerManualSync();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [permissions.canCreateTask, lockApp, triggerManualSync]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        deviceFrame,
        setDeviceFrame,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority,
        tasks,
        filteredTasks,
        categories,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        editingTask,
        setEditingTask,
        isTaskModalOpen,
        setIsTaskModalOpen,
        createCategory,
        currentMember,
        setCurrentMember,
        teamMembers,
        updateMemberRole,
        permissions,
        devices,
        syncState,
        networkCondition,
        setNetworkCondition,
        triggerManualSync,
        lastSyncedTimestamp,
        isLocked,
        lockApp,
        unlockApp,
        isBiometricModalOpen,
        setIsBiometricModalOpen,
        verifyBiometrics,
        settings,
        updateSettings,
        pomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        setPomodoroTask,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        inspectCryptoPayload,
        isCryptoInspectorOpen,
        setIsCryptoInspectorOpen,
        inspectingTask,
        setInspectingTask,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
