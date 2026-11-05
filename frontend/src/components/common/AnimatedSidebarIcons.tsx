import React from 'react';
import { motion } from 'framer-motion';

interface IconProps {
  isHovered: boolean;
  isActive: boolean;
  className?: string;
}

// 1. OVERVIEW: Subtle chart or dashboard element movement + smooth active-state transition
export const OverviewIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const accentColor = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Top Left Tile */}
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" stroke={strokeColor} strokeWidth="1.8" />
      {/* Top Right Tile */}
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" stroke={strokeColor} strokeWidth="1.8" />
      {/* Bottom Left Tile */}
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" stroke={strokeColor} strokeWidth="1.8" />
      {/* Bottom Right Tile */}
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" stroke={strokeColor} strokeWidth="1.8" />

      {/* Subtle dashboard data indicator movements */}
      <motion.line
        x1="6.75"
        y1="8.5"
        x2="6.75"
        y2="5.5"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { y1: [8.5, 6, 8.5] } : { y1: 8.5 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <motion.line
        x1="17.25"
        y1="8.5"
        x2="17.25"
        y2="6.2"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { y1: [8.5, 5.5, 8.5] } : { y1: 8.5 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="6.75"
        cy="17.25"
        r="1.6"
        fill={accentColor}
        animate={isHovered ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="17.25"
        cy="17.25"
        r="1.6"
        fill={strokeColor}
        animate={isHovered ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.8 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// 2. AI SCANNER: Scanning line animation + subtle detection frame animation
export const AIScannerIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const laserColor = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Corner Brackets / Detection Frame with subtle expansion animation */}
      <motion.path
        d="M4 8V5a1 1 0 0 1 1-1h3"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={isHovered ? { x: -1, y: -1 } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <motion.path
        d="M20 8V5a1 1 0 0 0-1-1h-3"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={isHovered ? { x: 1, y: -1 } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <motion.path
        d="M4 16v3a1 1 0 0 0 1 1h3"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={isHovered ? { x: -1, y: 1 } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <motion.path
        d="M20 16v3a1 1 0 0 1-1 1h-3"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={isHovered ? { x: 1, y: 1 } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />

      {/* Target object */}
      <circle cx="12" cy="12" r="3.2" stroke={strokeColor} strokeWidth="1.5" />

      {/* Scanning laser line */}
      <motion.line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={laserColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={{ y1: 12, y2: 12, opacity: 0 }}
        animate={isHovered ? { y1: [6, 18, 12], y2: [6, 18, 12], opacity: [0, 1, 0.4] } : { y1: 12, y2: 12, opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// 3. SMART BINS: Bin lid movement + subtle fill-level animation
export const SmartBinsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const fillGreen = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Bin Body */}
      <path
        d="M6 7L7 20C7 20.55 7.45 21 8 21H16C16.55 21 17 20.55 17 20L18 7"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Vertical rib lines */}
      <line x1="10" y1="10" x2="10" y2="17" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="14" y1="10" x2="14" y2="17" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* Subtle fill-level indicator rising */}
      <motion.rect
        x="8.5"
        y="14"
        width="7"
        height="5.5"
        rx="1"
        fill={fillGreen}
        initial={{ scaleY: 0.5, originY: 1 }}
        animate={isHovered ? { scaleY: [0.5, 0.9, 0.6] } : { scaleY: 0.5 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />

      {/* Bin Lid opening smoothly on hover */}
      <motion.g
        animate={isHovered ? { rotate: -16, y: -2.5 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ originX: '5px', originY: '7px' }}
      >
        <path d="M4 7H20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M10 4.5H14" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
};

// 4. LIVE MAP: Location pin movement + small radar pulse
export const LiveMapIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const pulseColor = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Map fold outline */}
      <polygon
        points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="9" y1="3" x2="9" y2="18" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <line x1="15" y1="6" x2="15" y2="21" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="1.5 1.5" />

      {/* Location Pin dropping and settling */}
      <motion.g
        animate={isHovered ? { y: [-3, 0] } : { y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <path
          d="M12 6C10.6 6 9.5 7.1 9.5 8.5C9.5 10.7 12 13.5 12 13.5C12 13.5 14.5 10.7 14.5 8.5C14.5 7.1 13.4 6 12 6Z"
          fill={pulseColor}
        />
        <circle cx="12" cy="8.5" r="1.2" fill="#FFFFFF" />
      </motion.g>

      {/* Small radar pulse wave */}
      <motion.circle
        cx="12"
        cy="13.5"
        r="2.5"
        stroke={pulseColor}
        strokeWidth="1.2"
        fill="none"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={isHovered ? { scale: [0.6, 2.2], opacity: [0.9, 0] } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </svg>
  );
};

// 5. ANALYTICS: Animated chart bars + smooth upward movement
export const AnalyticsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Chart Axes */}
      <path d="M3 20H21" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 4V20" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />

      {/* Bar 1 */}
      <motion.rect
        x="6"
        y="12"
        width="3"
        height="8"
        rx="1"
        fill={strokeColor}
        initial={{ scaleY: 1, originY: 1 }}
        animate={isHovered ? { scaleY: [1, 0.6, 1.1, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      {/* Bar 2 (Hero green bar) */}
      <motion.rect
        x="11"
        y="7"
        width="3"
        height="13"
        rx="1"
        fill={green}
        initial={{ scaleY: 1, originY: 1 }}
        animate={isHovered ? { scaleY: [1, 0.4, 1.25, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeInOut' }}
      />
      {/* Bar 3 */}
      <motion.rect
        x="16"
        y="10"
        width="3"
        height="10"
        rx="1"
        fill={strokeColor}
        initial={{ scaleY: 1, originY: 1 }}
        animate={isHovered ? { scaleY: [1, 0.7, 1.15, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// 6. PREDICTIONS: Forecast line drawing + smooth graph transition
export const PredictionsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Grid base */}
      <line x1="3" y1="20" x2="21" y2="20" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="5" x2="3" y2="20" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />

      {/* Historical line portion */}
      <path d="M4 16L9 11L13 14" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />

      {/* Forecast line portion drawing smoothly on hover */}
      <motion.path
        d="M13 14L17 8L21 6"
        stroke={green}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 2"
        initial={{ pathLength: 1 }}
        animate={isHovered ? { pathLength: [0.1, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Prediction indicator dot */}
      <motion.circle
        cx="21"
        cy="6"
        r="2"
        fill={green}
        animate={isHovered ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </svg>
  );
};

// 7. ROUTE OPTIMIZATION: Route path drawing + small location marker movement
export const RouteOptimizationIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Optimized route curve drawing on hover */}
      <motion.path
        d="M4 19C7 19 8 13 12 13C16 13 17 5 20 5"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 1 }}
        animate={isHovered ? { pathLength: [0.2, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />

      {/* Route waypoints */}
      <circle cx="4" cy="19" r="2.2" fill={green} />
      <circle cx="12" cy="13" r="2" fill={strokeColor} />
      <circle cx="20" cy="5" r="2.5" fill={green} />

      {/* Small location marker / vehicle tracer moving along path */}
      <motion.circle
        cx="4"
        cy="19"
        r="2.8"
        fill={green}
        animate={isHovered ? {
          cx: [4, 12, 20],
          cy: [19, 13, 5],
          scale: [1, 1.25, 1]
        } : { cx: 4, cy: 19 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// 8. COLLECTIONS: Collection indicator animation + subtle completion transition
export const CollectionsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const checkColor = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Collection truck chassis */}
      <path d="M3 6H13V17H3V6Z" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M13 10H17L20 13V17H13V10Z" stroke={strokeColor} strokeWidth="1.8" />

      {/* Wheels */}
      <circle cx="6.5" cy="18" r="2" stroke={strokeColor} strokeWidth="1.6" fill="#FFFFFF" />
      <circle cx="16.5" cy="18" r="2" stroke={strokeColor} strokeWidth="1.6" fill="#FFFFFF" />

      {/* Subtle completion check mark transition appearing in cargo area */}
      <motion.path
        d="M6 11.5L8 13.5L11 9"
        stroke={checkColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0.5, scale: 0.9 }}
        animate={isHovered ? { opacity: [0.3, 1, 0.9], scale: [0.8, 1.15, 1] } : { opacity: 0.5, scale: 0.9 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ originX: '8px', originY: '11px' }}
      />
    </svg>
  );
};

// 9. REPORTS: Document page movement + small chart element animation
export const ReportsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Document page with subtle lift/movement on hover */}
      <motion.g
        animate={isHovered ? { y: -1.5 } : { y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <path
          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline points="14 2 14 8 20 8" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Small chart lines inside document */}
        <motion.line
          x1="8"
          y1="13"
          x2="16"
          y2="13"
          stroke={green}
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 1 }}
          animate={isHovered ? { pathLength: [0.3, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        <motion.line
          x1="8"
          y1="17"
          x2="13"
          y2="17"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 1 }}
          animate={isHovered ? { pathLength: [0.4, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        />
      </motion.g>
    </svg>
  );
};

// 10. USERS: Profile or user-group animation
export const UserManagementIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Primary user avatar */}
      <circle cx="9" cy="7" r="3" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M3 19C3 15.5 5.5 13 9 13C12.5 13 15 15.5 15 19" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />

      {/* Secondary user popping into group smoothly on hover */}
      <motion.g
        animate={isHovered ? { y: [0, -1.8, 0], opacity: [0.6, 1, 0.85] } : { y: 0, opacity: 0.8 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <circle cx="17" cy="8" r="2.2" stroke={green} strokeWidth="1.6" />
        <path d="M14 19C14.2 16.5 15.5 14.5 18 14.5C20.5 14.5 22 16.5 22 19" stroke={green} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
};

// 11. AUDIT LOGS: Timeline indicator movement
export const AuditLogsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Shield / Security container */}
      <path
        d="M12 22S4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Timeline track */}
      <line x1="12" y1="7" x2="12" y2="17" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Moving timeline indicator marker */}
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        fill={green}
        animate={isHovered ? { cy: [8, 16, 12] } : { cy: 12 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// 12. SETTINGS: Smooth gear rotation
export const SettingsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <motion.g
        animate={isHovered ? { rotate: 60 } : { rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ originX: '12px', originY: '12px' }}
      >
        <circle cx="12" cy="12" r="3" stroke={strokeColor} strokeWidth="1.8" />
        <path
          d="M19.4 15A1.65 1.65 0 0 0 19.7 17.5L20.8 19.4A1.65 1.65 0 0 1 18.7 21.6L16.8 20.5A1.65 1.65 0 0 0 14.3 20.8A1.65 1.65 0 0 0 13 22H11A1.65 1.65 0 0 0 9.7 20.8A1.65 1.65 0 0 0 7.2 20.5L5.3 21.6A1.65 1.65 0 0 1 3.2 19.4L4.3 17.5A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.4 13.7L2.2 13A1.65 1.65 0 0 1 2.2 11L3.4 10.3A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4.3 6.5L3.2 4.6A1.65 1.65 0 0 1 5.3 2.4L7.2 3.5A1.65 1.65 0 0 0 9.7 3.2A1.65 1.65 0 0 0 11 2H13A1.65 1.65 0 0 0 14.3 3.2A1.65 1.65 0 0 0 16.8 3.5L18.7 2.4A1.65 1.65 0 0 1 20.8 4.6L19.7 6.5A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 20.6 10.3L21.8 11A1.65 1.65 0 0 1 21.8 13L20.6 13.7A1.65 1.65 0 0 0 19.4 15Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
};

// 13. CITIZEN PORTAL / GRIEVANCE
export const CitizenPortalIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#166534';
  const green = isActive ? '#4ADE80' : '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M12 7V13" stroke={green} strokeWidth="2" strokeLinecap="round" />
      <motion.circle
        cx="12"
        cy="17"
        r="1.2"
        fill={green}
        animate={isHovered ? { scale: [1, 1.6, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </svg>
  );
};
