import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { TopNavbar } from '../components/common/TopNavbar';
import { useAuth } from '../context/AuthContext';
import { Calendar, Building2 } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#17231C] flex">
      {/* Slim Vertical Left Sidebar */}
      <Sidebar />

      {/* Main App Container (offset by sidebar width 72px) */}
      <div className="flex-1 ml-[72px] flex flex-col min-h-screen">
        {/* Floating Top Navbar */}
        <TopNavbar />

        {/* Dashboard Sub-Header / Greeting Banner */}
        <div className="max-w-7xl mx-auto w-full px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17231C]">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-xs text-[#747D75] mt-0.5">
              EcoSort AI Platform • Intelligent municipal waste operations
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Municipality badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E7EBE7] text-xs font-medium text-slate-700 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{user?.municipality_name || 'Global Organization'}</span>
            </div>

            {/* Current Date */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E7EBE7] text-xs font-medium text-slate-700 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{todayStr}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Route Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

