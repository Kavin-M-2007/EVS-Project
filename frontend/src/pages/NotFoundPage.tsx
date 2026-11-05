import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/dashboard/super-admin';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'GARBAGE_COLLECTOR':
        return '/dashboard/collector';
      case 'MUNICIPALITY_MONITOR':
        return '/dashboard/monitor';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F4] flex flex-col justify-center items-center p-6 text-[#17231C]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E7EBE7] shadow-lg text-center space-y-6"
      >
        {/* Animated 404 Illustration Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#166534] flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-sm font-mono">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#17231C]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#747D75] leading-relaxed max-w-sm mx-auto">
            The requested municipal operational view or resource does not exist or has been relocated within the EcoSort AI network.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NavLink
            to={getHomeLink()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Dashboard</span>
          </NavLink>
          <NavLink
            to="/citizen-portal"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Citizen Portal</span>
          </NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
