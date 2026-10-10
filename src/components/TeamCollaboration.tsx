import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Users,
  ShieldAlert,
  Check,
  X,
  Smartphone,
  Laptop,
  Activity,
  UserCheck,
} from 'lucide-react';

export const TeamCollaboration: React.FC = () => {
  const {
    teamMembers,
    currentMember,
    setCurrentMember,
    updateMemberRole,
    permissions,
  } = useApp();

  const auditEvents = [
    {
      id: 'aud_1',
      user: 'Alex Rivera (Owner)',
      action: 'Rotated AES-256 vault master derivation seed',
      time: '12 minutes ago',
      icon: 'Shield',
    },
    {
      id: 'aud_2',
      user: 'Elena Rostova (Admin)',
      action: 'Synchronized 4 task revisions from iPhone 16 Pro',
      time: '45 minutes ago',
      icon: 'Sync',
    },
    {
      id: 'aud_3',
      user: 'Kenji Takahashi (Editor)',
      action: 'Completed task: Compact Responsive Viewports',
      time: '2 hours ago',
      icon: 'Check',
    },
    {
      id: 'aud_4',
      user: 'Sarah Chen (Viewer)',
      action: 'Generated monthly productivity PDF export',
      time: '5 hours ago',
      icon: 'File',
    },
  ];

  const PERMISSION_COLUMNS: { key: string; label: string }[] = [
    { key: 'canCreateTask', label: 'Create Tasks' },
    { key: 'canEditTask', label: 'Edit Tasks' },
    { key: 'canDeleteTask', label: 'Delete Tasks' },
    { key: 'canManageTeam', label: 'Manage Roles' },
    { key: 'canExportData', label: 'Export Data' },
    { key: 'canManageEncryption', label: 'Crypto Keys' },
  ];

  const ROLE_CAPABILITIES: Record<UserRole, Record<string, boolean>> = {
    owner: {
      canCreateTask: true,
      canEditTask: true,
      canDeleteTask: true,
      canManageTeam: true,
      canExportData: true,
      canManageEncryption: true,
    },
    admin: {
      canCreateTask: true,
      canEditTask: true,
      canDeleteTask: true,
      canManageTeam: true,
      canExportData: true,
      canManageEncryption: false,
    },
    editor: {
      canCreateTask: true,
      canEditTask: true,
      canDeleteTask: false,
      canManageTeam: false,
      canExportData: true,
      canManageEncryption: false,
    },
    viewer: {
      canCreateTask: false,
      canEditTask: false,
      canDeleteTask: false,
      canManageTeam: false,
      canExportData: false,
      canManageEncryption: false,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Team Collaboration & Granular RBAC
        </h2>
        <p className="text-xs text-slate-500">
          Role-based access control, active members, and cryptographic audit log
        </p>
      </div>

      {/* Team Members List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4">
          Active Team Members
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-10 w-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                      member.status === 'active'
                        ? 'bg-emerald-500'
                        : member.status === 'away'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {member.name}
                    </h4>
                    {currentMember.id === member.id && (
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{member.email}</span>
                    <span>·</span>
                    <span>{member.deviceCount} synced devices</span>
                  </div>
                </div>
              </div>

              {/* Role selection & active identity switch */}
              <div className="flex items-center gap-2">
                {permissions.canManageTeam ? (
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value as UserRole)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white capitalize"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                ) : (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                    {member.role}
                  </span>
                )}

                <button
                  onClick={() => setCurrentMember(member)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    currentMember.id === member.id
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {currentMember.id === member.id ? 'Active' : 'Switch To'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
          Granular Role Permission Matrix
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          Strict access policies enforced across API mutations and client views
        </p>

        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="pb-2 font-semibold text-slate-700 dark:text-slate-300">Role</th>
              {PERMISSION_COLUMNS.map((col) => (
                <th key={col.key} className="pb-2 text-center font-semibold text-slate-700 dark:text-slate-300">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(['owner', 'admin', 'editor', 'viewer'] as UserRole[]).map((role) => (
              <tr key={role} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 font-medium text-slate-900 dark:text-white capitalize">
                  {role}
                </td>
                {PERMISSION_COLUMNS.map((col) => {
                  const allowed = ROLE_CAPABILITIES[role][col.key];
                  return (
                    <td key={col.key} className="py-2.5 text-center">
                      {allowed ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Audit Trail */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
          Activity & Synchronization Audit Log
        </h3>
        <div className="space-y-2.5">
          {auditEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-950"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-indigo-500" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{ev.user}</span>
                  <span className="text-slate-500"> {ev.action}</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                {ev.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
