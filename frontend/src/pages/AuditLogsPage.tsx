import React, { useEffect, useState } from 'react';
import { ShieldCheck, Filter, Search, Clock, User, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.getAuditLogs(actionFilter === 'all' ? undefined : actionFilter);
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Security & Compliance Trail
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            System Audit Logs & Operational Records
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Trace authentication events, task assignments, sensor overrides and user provision operations.
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Events</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="USER_CREATED">Account Provisioning</option>
            <option value="MUNICIPALITY_CREATED">Municipality Setup</option>
            <option value="PASSWORD_RESET">Password Changes</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Operator</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Action Event</th>
                <th className="pb-3">Audit Details</th>
                <th className="pb-3 text-right">Host IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">{log.user_email || 'System'}</td>
                  <td className="py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                      {log.user_role || 'CORE'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600 max-w-xs truncate">{log.details}</td>
                  <td className="py-3.5 text-right font-mono text-slate-400 text-[11px]">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

