import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const TopNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ADMIN':
        return { label: 'Municipal Admin', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'GARBAGE_COLLECTOR':
        return { label: 'Field Collector', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'MUNICIPALITY_MONITOR':
        return { label: 'Municipal Monitor', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'Staff', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-4 z-30 px-6 max-w-7xl mx-auto w-full">
      <div className="bg-white/90 backdrop-blur-md border border-[#E7EBE7] rounded-full px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
        {/* Left: Brand & Pill Nav Links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#166534] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              E
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-[#17231C] tracking-tight text-sm">
                EcoSort<span className="text-[#22C55E] ml-0.5">AI</span>
              </span>
            </div>
          </div>

          {/* Quick Pill Navigation */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-[#747D75]">
            <NavLink
              to={
                user?.role === 'SUPER_ADMIN'
                  ? '/dashboard/super-admin'
                  : user?.role === 'ADMIN'
                  ? '/dashboard/admin'
                  : user?.role === 'GARBAGE_COLLECTOR'
                  ? '/dashboard/collector'
                  : '/dashboard/monitor'
              }
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#DCFCE7] text-[#166534] font-semibold' : 'hover:text-[#17231C] hover:bg-slate-50'
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#DCFCE7] text-[#166534] font-semibold' : 'hover:text-[#17231C] hover:bg-slate-50'
                }`
              }
            >
              Activity
            </NavLink>
            <NavLink
              to="/smart-bins"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#DCFCE7] text-[#166534] font-semibold' : 'hover:text-[#17231C] hover:bg-slate-50'
                }`
              }
            >
              Manage
            </NavLink>
            <NavLink
              to="/predictions"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#DCFCE7] text-[#166534] font-semibold' : 'hover:text-[#17231C] hover:bg-slate-50'
                }`
              }
            >
              Intelligence
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#DCFCE7] text-[#166534] font-semibold' : 'hover:text-[#17231C] hover:bg-slate-50'
                }`
              }
            >
              Reports
            </NavLink>
          </nav>
        </div>

        {/* Center: Search pill */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 text-[#747D75] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search bins, tasks, zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F6F4] text-xs text-[#17231C] placeholder-[#747D75] pl-8 pr-3 py-1.5 rounded-full border border-transparent focus:border-emerald-300 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Right Controls: System Status, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* System Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-medium px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online • IoT Sync</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowProfileMenu(false);
              }}
              className="w-8 h-8 rounded-full border border-[#E7EBE7] flex items-center justify-center text-[#17231C] hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-3.5 h-3.5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            <AnimatePresence>
              {showNotifMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#E7EBE7] p-3 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900">Notifications ({unreadCount} new)</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-emerald-700 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 mt-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`py-2 px-1 text-xs cursor-pointer transition-colors ${
                            n.is_read ? 'opacity-60' : 'bg-emerald-50/50 rounded-lg'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-[11px]">{n.title}</span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-green-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-[#17231C] leading-none">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#747D75] leading-none mt-0.5">
                  {user?.municipality_name?.split(' ')[0] || 'Global'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#E7EBE7] p-3 z-50"
                >
                  <div className="pb-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${roleInfo.bg}`}>
                        {roleInfo.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {user?.employee_id}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <NavLink
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 text-xs text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                      <span>Security & Profile</span>
                    </NavLink>
                    <div className="flex items-center gap-2 text-xs text-slate-500 px-2 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{user?.municipality_name || 'Global Organization'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

