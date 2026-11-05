import React from 'react';
import { BinStatus, TaskStatus, TaskPriority, UserRole } from '../../types';

export const BinStatusBadge: React.FC<{ status: BinStatus }> = ({ status }) => {
  switch (status) {
    case 'NORMAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Normal
        </span>
      );
    case 'NEAR_FULL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Near Full
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          Critical
        </span>
      );
    case 'OFFLINE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Offline
        </span>
      );
  }
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          ✓ Completed
        </span>
      );
    case 'Collected':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
          Collected
        </span>
      );
    case 'In Progress':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          In Progress
        </span>
      );
    case 'Accepted':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Accepted
        </span>
      );
    case 'Assigned':
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Assigned
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case 'HIGH':
      return <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">High</span>;
    case 'MEDIUM':
      return <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Medium</span>;
    case 'LOW':
    default:
      return <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">Low</span>;
  }
};

export const UserRoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Super Admin</span>;
    case 'ADMIN':
      return <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Admin</span>;
    case 'GARBAGE_COLLECTOR':
      return <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Collector</span>;
    case 'MUNICIPALITY_MONITOR':
      return <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">Monitor</span>;
    default:
      return <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">Staff</span>;
  }
};

