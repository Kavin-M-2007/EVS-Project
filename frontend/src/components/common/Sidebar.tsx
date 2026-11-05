import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  OverviewIcon,
  AIScannerIcon,
  SmartBinsIcon,
  LiveMapIcon,
  AnalyticsIcon,
  PredictionsIcon,
  RouteOptimizationIcon,
  CollectionsIcon,
  UserManagementIcon,
  CitizenPortalIcon,
  ReportsIcon,
  AuditLogsIcon,
  SettingsIcon,
} from './AnimatedSidebarIcons';
import {
  MiniBinsIllustration,
  MiniScannerIllustration,
  MiniRouteIllustration,
  MiniAnalyticsIllustration,
  MiniPredictionsIllustration,
  MiniDefaultIllustration,
} from './MiniIllustrations';

interface NavItem {
  id: string;
  label: string;
  path: string;
  description: string;
  icon: React.ComponentType<{ isHovered: boolean; isActive: boolean }>;
  miniIllustration?: React.ComponentType<any>;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Generate navigation list according to role (Requirement #12)
  const getNavItems = (): NavItem[] => {
    const role = user?.role || 'SUPER_ADMIN';

    if (role === 'SUPER_ADMIN') {
      return [
        { id: 'overview', label: 'Overview', path: '/dashboard/super-admin', description: 'Global multi-municipality operational overview & telemetry', icon: OverviewIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'users', label: 'User Management', path: '/users', description: 'Manage administrators, assign municipalities and RBAC credentials', icon: UserManagementIcon, miniIllustration: MiniDefaultIllustration },
        { id: 'ai-scanner', label: 'AI Scanner', path: '/ai-scanner', description: 'Multiclass neural vision waste classifier with 36 classes', icon: AIScannerIcon, miniIllustration: MiniScannerIllustration },
        { id: 'smart-bins', label: 'Smart Bins', path: '/smart-bins', description: 'IoT smart bin fleet monitoring, telemetry, fill levels and alerts', icon: SmartBinsIcon, miniIllustration: MiniBinsIllustration },
        { id: 'live-map', label: 'City Map', path: '/map', description: 'Geographic GIS map with smart bin coordinates and live vehicles', icon: LiveMapIcon, miniIllustration: MiniRouteIllustration },
        { id: 'analytics', label: 'Analytics', path: '/analytics', description: 'Cross-municipal recycling efficiency and waste trends', icon: AnalyticsIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'predictions', label: 'AI Predictions', path: '/predictions', description: '7-day waste generation forecasting and overflow risk countdowns', icon: PredictionsIcon, miniIllustration: MiniPredictionsIllustration },
        { id: 'route-opt', label: 'Route Optimizer', path: '/route-optimization', description: 'Intelligent 2-Opt TSP shortest-path collection routing', icon: RouteOptimizationIcon, miniIllustration: MiniRouteIllustration },
        { id: 'collections', label: 'Collections', path: '/collections', description: 'Fleet task management, vehicle assignments and completion proof', icon: CollectionsIcon, miniIllustration: MiniRouteIllustration },
        { id: 'reports', label: 'Reports', path: '/reports', description: 'Export official environmental audit reports in PDF and CSV', icon: ReportsIcon, miniIllustration: MiniDefaultIllustration },
        { id: 'audit-logs', label: 'Audit Logs', path: '/audit-logs', description: 'System-wide immutable security logs and RBAC change history', icon: AuditLogsIcon, miniIllustration: MiniDefaultIllustration },
        { id: 'settings', label: 'Settings', path: '/settings', description: 'Global system configuration and municipal profile settings', icon: SettingsIcon, miniIllustration: MiniDefaultIllustration },
      ];
    } else if (role === 'ADMIN') {
      return [
        { id: 'overview', label: 'Overview', path: '/dashboard/admin', description: 'Municipal waste metrics, collector active tasks and bin fill rates', icon: OverviewIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'ai-scanner', label: 'AI Scanner', path: '/ai-scanner', description: 'Multiclass neural vision waste classifier with 36 classes', icon: AIScannerIcon, miniIllustration: MiniScannerIllustration },
        { id: 'smart-bins', label: 'Smart Bins', path: '/smart-bins', description: 'Municipal smart bins, fill levels, battery levels and overflow warnings', icon: SmartBinsIcon, miniIllustration: MiniBinsIllustration },
        { id: 'collections', label: 'Collection Hub', path: '/collections', description: 'Assign tasks to collectors, set priority and verify proof photos', icon: CollectionsIcon, miniIllustration: MiniRouteIllustration },
        { id: 'users', label: 'Staff Management', path: '/users', description: 'Manage local garbage collectors and municipal monitors', icon: UserManagementIcon, miniIllustration: MiniDefaultIllustration },
        { id: 'live-map', label: 'Live Map', path: '/map', description: 'Monitor field vehicles, smart bin locations and active routes', icon: LiveMapIcon, miniIllustration: MiniRouteIllustration },
        { id: 'route-opt', label: 'Route Optimizer', path: '/route-optimization', description: 'Generate optimal collection tours to minimize fuel and transit time', icon: RouteOptimizationIcon, miniIllustration: MiniRouteIllustration },
        { id: 'analytics', label: 'Analytics', path: '/analytics', description: 'Local waste generation statistics and recycling performance', icon: AnalyticsIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'reports', label: 'Reports', path: '/reports', description: 'Generate municipal compliance reports with PDF/CSV export', icon: ReportsIcon, miniIllustration: MiniDefaultIllustration },
      ];
    } else if (role === 'GARBAGE_COLLECTOR') {
      return [
        { id: 'collector-dash', label: 'My Dashboard', path: '/dashboard/collector', description: 'Daily task status, route progress, and collection metrics', icon: OverviewIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'tasks', label: 'My Tasks', path: '/collections', description: 'Review assigned collection orders and update step-by-step progress', icon: CollectionsIcon, miniIllustration: MiniRouteIllustration },
        { id: 'live-map', label: 'Collection Map', path: '/map', description: 'Turn-by-turn route map highlighting bins scheduled for pickup', icon: LiveMapIcon, miniIllustration: MiniRouteIllustration },
        { id: 'smart-bins', label: 'Smart Bins', path: '/smart-bins', description: 'Inspect bin fill percentages and sensor states along your route', icon: SmartBinsIcon, miniIllustration: MiniBinsIllustration },
        { id: 'ai-scanner', label: 'AI Scanner', path: '/ai-scanner', description: 'Quick camera classification for mixed or unknown waste items', icon: AIScannerIcon, miniIllustration: MiniScannerIllustration },
        { id: 'citizen-portal', label: 'Report Issue', path: '/citizen-portal', description: 'Log broken lids, hazardous spills or overflowing street bins', icon: CitizenPortalIcon, miniIllustration: MiniDefaultIllustration },
      ];
    } else {
      // MUNICIPALITY_MONITOR
      return [
        { id: 'monitor-dash', label: 'Overview', path: '/dashboard/monitor', description: 'Supervisory monitoring of municipal waste operations', icon: OverviewIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'live-map', label: 'Live Monitoring', path: '/map', description: 'Real-time observation of active vehicles and critical bins', icon: LiveMapIcon, miniIllustration: MiniRouteIllustration },
        { id: 'smart-bins', label: 'Smart Bins', path: '/smart-bins', description: 'Supervise bin status without administrative mutation access', icon: SmartBinsIcon, miniIllustration: MiniBinsIllustration },
        { id: 'collections', label: 'Collection Tracking', path: '/collections', description: 'Track collector task completion rates and verified proof', icon: CollectionsIcon, miniIllustration: MiniRouteIllustration },
        { id: 'analytics', label: 'Area Performance', path: '/analytics', description: 'Area-wise waste generation breakdown and recycling ratios', icon: AnalyticsIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'predictions', label: 'AI Predictions', path: '/predictions', description: 'Inspect AI forecasted overflow risks and mitigation alerts', icon: PredictionsIcon, miniIllustration: MiniPredictionsIllustration },
        { id: 'reports', label: 'Audit Reports', path: '/reports', description: 'Download authorized supervisory reports and performance data', icon: ReportsIcon, miniIllustration: MiniDefaultIllustration },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-white border-r border-[#E7EBE7] flex flex-col items-center py-5 z-40 shadow-[1px_0_4px_rgba(0,0,0,0.02)] select-none">
      {/* Brand Icon Mark */}
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
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 mb-6 hover:scale-105 transition-transform"
        title="EcoSort AI"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
          <path d="M10 10v4" />
          <path d="M14 10v4" />
          <path d="M12 2v3" />
        </svg>
      </NavLink>

      {/* Nav List */}
      <div className="flex-1 w-full flex flex-col items-center space-y-3 overflow-y-auto overflow-x-visible py-2 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const MiniIllust = item.miniIllustration || MiniDefaultIllustration;
          const isHovered = hoveredItem === item.id;

          return (
            <div
              key={item.id}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#17231C] text-white shadow-sm shadow-slate-900/20'
                      : 'text-[#166534] hover:bg-[#DCFCE7]/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon isHovered={isHovered} isActive={isActive} />
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute -left-3 w-1.5 h-6 bg-[#22C55E] rounded-r-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>

              {/* Floating Contextual Hover Panel (Requirement #5) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 12, scale: 0.95 }}
                    animate={{ opacity: 1, x: 22, scale: 1 }}
                    exit={{ opacity: 0, x: 12, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-12 w-64 bg-white rounded-2xl p-3.5 shadow-xl border border-[#E7EBE7] z-50 pointer-events-none flex items-center gap-3"
                  >
                    <div className="flex-shrink-0">
                      <MiniIllust label={item.label} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#17231C] leading-tight">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-[#747D75] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Citizen Portal Shortcut at bottom */}
      <div className="mt-auto pt-3 border-t border-[#E7EBE7] w-full flex flex-col items-center">
        <NavLink
          to="/citizen-portal"
          title="Citizen Public Portal"
          className={({ isActive }) =>
            `w-11 h-11 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              isActive
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`
          }
        >
          <CitizenPortalIcon isHovered={false} isActive={false} />
        </NavLink>
      </div>
    </aside>
  );
};

