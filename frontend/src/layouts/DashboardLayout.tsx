import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/common/Sidebar';
import { TopNavbar } from '../components/common/TopNavbar';
import { useAuth } from '../context/AuthContext';
import { Calendar, Building2, LayoutDashboard, Trash2, Map, CheckSquare, ScanLine, Menu } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [todayStr] = useState(() =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date())
  );

  const normalizedRole = (user?.role || 'SUPER_ADMIN').toUpperCase().replace(/-/g, '_');

  const getDashboardHome = () => {
    switch (normalizedRole) {
      case 'SUPER_ADMIN':
        return '/dashboard/super-admin';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'GARBAGE_COLLECTOR':
        return '/dashboard/collector';
      case 'MUNICIPALITY_MONITOR':
        return '/dashboard/monitor';
      default:
        return '/dashboard/super-admin';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#17231C] flex flex-col md:flex-row overflow-x-hidden">
      {/* Slim Vertical Left Sidebar for Desktop/Tablet & Slide-over Mobile Drawer */}
      <Sidebar
        isMobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 ml-0 md:ml-[72px] flex flex-col min-h-screen max-w-full overflow-x-hidden pb-20 md:pb-8">
        {/* Floating Top Navbar */}
        <TopNavbar onToggleMobileMenu={() => setMobileDrawerOpen(prev => !prev)} />

        {/* Dashboard Sub-Header / Greeting Banner */}
        <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17231C]">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-xs text-[#747D75] mt-0.5">
              EcoSort AI Platform • Intelligent municipal waste operations
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Municipality badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E7EBE7] text-xs font-medium text-slate-700 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-none">{user?.municipality_name || 'Global Organization'}</span>
            </div>

            {/* Current Date */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E7EBE7] text-xs font-medium text-slate-700 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{todayStr}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on screens < md) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7EBE7] px-2 py-2 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      >
        <NavLink
          to={getDashboardHome()}
          aria-label="Dashboard Overview"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-[#166534] font-semibold' : 'text-[#747D75] hover:text-[#17231C]'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </NavLink>

        <NavLink
          to="/smart-bins"
          aria-label="Smart Bins"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-[#166534] font-semibold' : 'text-[#747D75] hover:text-[#17231C]'
            }`
          }
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px]">Bins</span>
        </NavLink>

        <NavLink
          to="/map"
          aria-label="Live Map"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-[#166534] font-semibold' : 'text-[#747D75] hover:text-[#17231C]'
            }`
          }
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px]">Map</span>
        </NavLink>

        <NavLink
          to="/collections"
          aria-label="Collection Tasks"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-[#166534] font-semibold' : 'text-[#747D75] hover:text-[#17231C]'
            }`
          }
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Tasks</span>
        </NavLink>

        <NavLink
          to="/ai-scanner"
          aria-label="AI Scanner"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-[#166534] font-semibold' : 'text-[#747D75] hover:text-[#17231C]'
            }`
          }
        >
          <ScanLine className="w-5 h-5" />
          <span className="text-[10px]">AI Scan</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open full menu"
          className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all text-[#747D75] hover:text-[#17231C]"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardLayout;
