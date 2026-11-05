import React from 'react';
import { Shield, UserCheck, Truck, Eye } from 'lucide-react';

interface Props {
  onSelectAccount: (email: string) => void;
}

export const DemoCredentialsBar: React.FC<Props> = ({ onSelectAccount }) => {
  const accounts = [
    {
      role: 'Super Admin',
      email: 'superadmin@ecosort.ai',
      badge: 'Global Authority',
      icon: Shield,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    },
    {
      role: 'Municipal Admin',
      email: 'admin.metro@ecosort.ai',
      badge: 'Coimbatore Zone',
      icon: UserCheck,
      color: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
    },
    {
      role: 'Garbage Collector',
      email: 'collector.metro@ecosort.ai',
      badge: 'Field Ops Mobile',
      icon: Truck,
      color: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
    },
    {
      role: 'Municipality Monitor',
      email: 'monitor.metro@ecosort.ai',
      badge: 'Audit & Analytics',
      icon: Eye,
      color: 'border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100',
    },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#E7EBE7] shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          Quick Demo Login (Password: <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">Admin@123</code>)
        </span>
        <span className="text-[10px] text-emerald-700 font-medium">Click to fill</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelectAccount(acc.email)}
              className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${acc.color}`}
            >
              <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold leading-tight">{acc.role}</span>
                  <span className="text-[9px] opacity-75 font-medium">{acc.badge}</span>
                </div>
                <div className="text-[10px] opacity-80 truncate font-mono">{acc.email}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

