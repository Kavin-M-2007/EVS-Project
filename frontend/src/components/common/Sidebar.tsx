import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { X } from 'lucide-react';
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

export interface NavItem {
  id: string;
  label: string;
  path: string;
  description: string;
  icon: React.ComponentType<{ isHovered: boolean; isActive: boolean }>;
  miniIllustration?: React.ComponentType<any>;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface HoveredTooltipInfo {
  id: string;
  label: string;
  description: string;
  miniIllustration?: React.ComponentType<any>;
  top: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredTooltipInfo | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

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

  // Generate navigation list according to role (Requirement #12)
  const getNavItems = (): NavItem[] => {
    if (normalizedRole === 'SUPER_ADMIN') {
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
    } else if (normalizedRole === 'ADMIN') {
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
    } else if (normalizedRole === 'GARBAGE_COLLECTOR') {
      return [
        { id: 'collector-dash', label: 'My Dashboard', path: '/dashboard/collector', description: 'Daily task status, route progress, and collection metrics', icon: OverviewIcon, miniIllustration: MiniAnalyticsIllustration },
        { id: 'tasks', label: 'My Tasks', path: '/collections', description: 'Review assigned collection orders and update step-by-step progress', icon: CollectionsIcon, miniIllustration: MiniRouteIllustration },
        { id: 'live-map', label: 'Collection Map', path: '/map', description: 'Turn-by-turn route map highlighting bins scheduled for pickup', icon: LiveMapIcon, miniIllustration: MiniRouteIllustration },
        { id: 'smart-bins', label: 'Smart Bins', path: '/smart-bins', description: 'Inspect bin fill percentages and sensor states along your route', icon: SmartBinsIcon, miniIllustration: MiniBinsIllustration },
        { id: 'ai-scanner', label: 'AI Scanner', path: '/ai-scanner', description: 'Quick camera classification for mixed or unknown waste items', icon: AIScannerIcon, miniIllustration: MiniScannerIllustration },
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
  const dashboardHome = getDashboardHome();

  return (
    <>
      {/* Desktop / Tablet Slim Vertical Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] bg-white border-r border-[#E7EBE7] flex-col items-center py-5 z-40 shadow-[1px_0_4px_rgba(0,0,0,0.02)] select-none">
        {/* Brand Icon Mark */}
        <NavLink
          to={dashboardHome}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 mb-6 hover:scale-105 transition-transform flex-shrink-0"
          title="EcoSort AI"
          aria-label="EcoSort AI Dashboard Home"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredItemId('brand-home');
            setHoveredTooltip({
              id: 'brand-home',
              label: 'EcoSort AI',
              description: 'Operational control centre & municipal overview',
              miniIllustration: MiniAnalyticsIllustration,
              top: rect.top + rect.height / 2,
            });
          }}
          onMouseLeave={() => {
            setHoveredItemId(null);
            setHoveredTooltip(null);
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
            <path d="M10 10v4" />
            <path d="M14 10v4" />
            <path d="M12 2v3" />
          </svg>
        </NavLink>

        {/* Nav List */}
        <div
          className="flex-1 w-full flex flex-col items-center space-y-3 overflow-y-auto overflow-x-hidden py-2 no-scrollbar"
          onScroll={() => setHoveredTooltip(null)}
        >
          <LayoutGroup id="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative flex items-center justify-center"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredItemId(item.id);
                    setHoveredTooltip({
                      id: item.id,
                      label: item.label,
                      description: item.description,
                      miniIllustration: item.miniIllustration,
                      top: rect.top + rect.height / 2,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredItemId(null);
                    setHoveredTooltip(null);
                  }}
                >
                  <NavLink
                    to={item.path}
                    aria-label={item.label}
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
                </div>
              );
            })}
          </LayoutGroup>
        </div>

        {/* Citizen Portal Shortcut at bottom */}
        <div className="mt-auto pt-3 border-t border-[#E7EBE7] w-full flex flex-col items-center flex-shrink-0">
          <NavLink
            to="/citizen-portal"
            title="Citizen Public Portal"
            aria-label="Citizen Public Portal"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItemId('citizen-portal-bottom');
              setHoveredTooltip({
                id: 'citizen-portal-bottom',
                label: 'Citizen Public Portal',
                description: 'Public grievance reporting, street litter alerts and ticket tracking',
                miniIllustration: MiniDefaultIllustration,
                top: rect.top + rect.height / 2,
              });
            }}
            onMouseLeave={() => {
              setHoveredItemId(null);
              setHoveredTooltip(null);
            }}
            className={({ isActive }) =>
              `w-11 h-11 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`
            }
          >
            <CitizenPortalIcon isHovered={hoveredItemId === 'citizen-portal-bottom'} isActive={false} />
          </NavLink>
        </div>

        {/* Floating Contextual Hover Panel (Rendered fixed outside scroll container to prevent clipping) */}
        <AnimatePresence>
          {hoveredTooltip && (
            <motion.div
              key={hoveredTooltip.id}
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: '80px',
                top: `${hoveredTooltip.top}px`,
                transform: 'translateY(-50%)',
              }}
              className="w-64 bg-white rounded-2xl p-3.5 shadow-2xl border border-[#E7EBE7] z-50 pointer-events-none flex items-center gap-3 select-none"
            >
              <div className="flex-shrink-0">
                {React.createElement(hoveredTooltip.miniIllustration || MiniDefaultIllustration, {
                  label: hoveredTooltip.label,
                })}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#17231C] leading-tight">
                  {hoveredTooltip.label}
                </h4>
                <p className="text-[11px] text-[#747D75] mt-1 line-clamp-2 leading-relaxed">
                  {hoveredTooltip.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Mobile Drawer (Visible on < md when isMobileOpen is true) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={onCloseMobile}
            />

            {/* Slide-over Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#E7EBE7] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    E
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#17231C]">
                      EcoSort<span className="text-[#22C55E]">AI</span>
                    </h3>
                    <p className="text-[10px] text-[#747D75]">
                      {normalizedRole.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items List with full labels and icons */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#17231C] text-white shadow-sm'
                            : 'text-[#166534] hover:bg-emerald-50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <Icon isHovered={false} isActive={isActive} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{item.label}</div>
                            <div className={`text-[10px] font-normal truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-[#747D75]'}`}>
                              {item.description}
                            </div>
                          </div>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              {/* Citizen Portal Link at bottom */}
              <div className="p-3 border-t border-[#E7EBE7]">
                <NavLink
                  to="/citizen-portal"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <CitizenPortalIcon isHovered={false} isActive={false} />
                  <span>Public Grievance Portal</span>
                </NavLink>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
