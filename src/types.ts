/**
 * OmniSync Core Type Definitions
 */

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'in_progress' | 'in_review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // ISO date string YYYY-MM-DD
  estimatedMinutes: number;
  elapsedMinutes: number;
  tags: string[];
  subtasks: Subtask[];
  assignedMemberId: string;
  isEncrypted: boolean;
  createdAt: number;
  updatedAt: number;
  syncRevision: number;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color or Tailwind accent
  icon: string;
  description: string;
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'away' | 'offline';
  deviceCount: number;
}

export interface RolePermissions {
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canManageTeam: boolean;
  canExportData: boolean;
  canManageEncryption: boolean;
}

export interface PairedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  platform: string;
  lastSyncAt: number;
  isCurrent: boolean;
  ipAddress: string;
  batteryLevel: number;
  isOnline: boolean;
}

export type NetworkCondition = 'online' | 'flaky' | 'offline';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'pending';

export interface SyncMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'category' | 'member';
  entityId: string;
  payload: any;
  timestamp: number;
  revision: number;
}

export interface EncryptedPayload {
  version: number;
  iv: string; // Base64
  salt: string; // Base64
  ciphertext: string; // Base64
  tagLength: number;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'security';
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'high-contrast';
  fontScale: 90 | 100 | 110 | 125;
  hapticFeedback: boolean;
  soundEnabled: boolean;
  pushNotifications: boolean;
  autoLockMinutes: number;
  networkSimulation: NetworkCondition;
  encryptionPassphraseSet: boolean;
  biometricsEnabled: boolean;
  mfaEnabled: boolean;
}

export type ActiveTab = 'tasks' | 'matrix' | 'analytics' | 'team' | 'security' | 'devices';
export type TaskViewMode = 'kanban' | 'list';
export type DeviceFrameMode = 'native' | 'laptop' | 'tablet' | 'mobile';
