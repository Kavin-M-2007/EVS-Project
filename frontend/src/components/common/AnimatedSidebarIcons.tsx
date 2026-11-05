import React from 'react';
import { motion } from 'framer-motion';

interface IconProps {
  isHovered: boolean;
  isActive: boolean;
  className?: string;
}

export const OverviewIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const accent = isActive ? '#22C55E' : '#15803D';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Grid container */}
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />

      {/* Sequential animated bars/dots */}
      <motion.line
        x1="6.5"
        y1="8"
        x2="6.5"
        y2="5"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ scaleY: 0.5, originY: 1 }}
        animate={isHovered ? { scaleY: [0.3, 1, 0.6] } : { scaleY: 1 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
      />
      <motion.line
        x1="17.5"
        y1="8"
        x2="17.5"
        y2="6"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ scaleY: 0.5, originY: 1 }}
        animate={isHovered ? { scaleY: [0.5, 1, 0.4] } : { scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.2, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
      />
      {/* Pulsing indicator */}
      <motion.circle
        cx="6.5"
        cy="17.5"
        r="1.8"
        fill={accent}
        animate={isHovered ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : { scale: 1 }}
        transition={{ duration: 0.9, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const AIScannerIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const laserColor = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Scanner brackets */}
      <motion.path
        d="M4 8V5a1 1 0 0 1 1-1h3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { x: [-1, 0, -1], y: [-1, 0, -1] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.path
        d="M20 8V5a1 1 0 0 0-1-1h-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { x: [1, 0, 1], y: [-1, 0, -1] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.path
        d="M4 16v3a1 1 0 0 0 1 1h3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { x: [-1, 0, -1], y: [1, 0, 1] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.path
        d="M20 16v3a1 1 0 0 1-1 1h-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { x: [1, 0, 1], y: [1, 0, 1] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
      />

      {/* Center target object */}
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" />

      {/* Laser beam moving vertically */}
      <motion.line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={laserColor}
        strokeWidth="2"
        strokeLinecap="round"
        animate={isHovered ? { y1: [6, 18, 6], y2: [6, 18, 6], opacity: [0.4, 1, 0.4] } : { y1: 12, y2: 12, opacity: 0 }}
        transition={{ duration: 1.4, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
      />
    </svg>
  );
};

export const SmartBinsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const fillGreen = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Bin Body */}
      <path d="M6 7L7 20C7 20.5523 7.44772 21 8 21H16C16.5523 21 17 20.5523 17 20L18 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* Rising fill level */}
      <motion.rect
        x="8"
        y="13"
        width="8"
        height="6"
        rx="1"
        fill={fillGreen}
        initial={{ scaleY: 0.4, originY: 1 }}
        animate={isHovered ? { scaleY: [0.4, 1, 0.4] } : { scaleY: 0.4 }}
        transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
      />

      {/* Bin Lid opening slightly */}
      <motion.g
        animate={isHovered ? { rotate: -15, y: -2 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ originX: '5px', originY: '7px' }}
      >
        <path d="M4 7H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M10 4H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* IoT Sensor pulse wave */}
      <motion.path
        d="M10 2C11 1.2 13 1.2 14 2"
        stroke={fillGreen}
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={isHovered ? { opacity: [0, 1, 0], scale: [0.8, 1.3, 1.5] } : { opacity: 0 }}
        transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const LiveMapIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const ripple = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Map outline */}
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />

      {/* Location Pin dropping */}
      <motion.g
        animate={isHovered ? { y: [-3, 0, -2, 0] } : { y: 0 }}
        transition={{ duration: 1.1, repeat: isHovered ? Infinity : 0 }}
      >
        <path d="M12 7C10.6 7 9.5 8.1 9.5 9.5C9.5 11.5 12 14 12 14C12 14 14.5 11.5 14.5 9.5C14.5 8.1 13.4 7 12 7Z" fill={ripple} />
        <circle cx="12" cy="9.5" r="1.2" fill="#FFFFFF" />
      </motion.g>

      {/* Ripple ring */}
      <motion.circle
        cx="12"
        cy="14"
        r="3"
        stroke={ripple}
        strokeWidth="1.2"
        fill="none"
        animate={isHovered ? { scale: [0.5, 2], opacity: [0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const AnalyticsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const green = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Axis */}
      <path d="M3 20H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 4V20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* Bar 1 */}
      <motion.rect
        x="6"
        y="12"
        width="3"
        height="8"
        rx="1"
        fill={color}
        initial={{ scaleY: 0.5, originY: 1 }}
        animate={isHovered ? { scaleY: [0.4, 1, 0.5] } : { scaleY: 1 }}
        transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
      />
      {/* Bar 2 */}
      <motion.rect
        x="11"
        y="8"
        width="3"
        height="12"
        rx="1"
        fill={green}
        initial={{ scaleY: 0.6, originY: 1 }}
        animate={isHovered ? { scaleY: [0.6, 1.2, 0.7] } : { scaleY: 1 }}
        transition={{ duration: 1, delay: 0.2, repeat: isHovered ? Infinity : 0 }}
      />
      {/* Bar 3 */}
      <motion.rect
        x="16"
        y="5"
        width="3"
        height="15"
        rx="1"
        fill={color}
        initial={{ scaleY: 0.8, originY: 1 }}
        animate={isHovered ? { scaleY: [0.8, 1, 0.6] } : { scaleY: 1 }}
        transition={{ duration: 1, delay: 0.4, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const PredictionsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const pulse = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Neural network nodes */}
      <circle cx="5" cy="7" r="2" fill={color} />
      <circle cx="5" cy="17" r="2" fill={color} />
      <circle cx="12" cy="12" r="2.5" fill={pulse} />
      <circle cx="19" cy="6" r="2" fill={color} />
      <circle cx="19" cy="18" r="2" fill={color} />

      {/* Connecting lines */}
      <motion.line
        x1="5"
        y1="7"
        x2="12"
        y2="12"
        stroke={color}
        strokeWidth="1.5"
        animate={isHovered ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.8 }}
        transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.line
        x1="5"
        y1="17"
        x2="12"
        y2="12"
        stroke={color}
        strokeWidth="1.5"
        animate={isHovered ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.2, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="19"
        y2="6"
        stroke={pulse}
        strokeWidth="1.8"
        animate={isHovered ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.4, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="19"
        y2="18"
        stroke={pulse}
        strokeWidth="1.8"
        animate={isHovered ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.6, repeat: isHovered ? Infinity : 0 }}
      />

      {/* Central AI node pulse */}
      <motion.circle
        cx="12"
        cy="12"
        r="4.5"
        stroke={pulse}
        strokeWidth="1.2"
        fill="none"
        animate={isHovered ? { scale: [1, 1.8], opacity: [0.8, 0] } : { opacity: 0 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const RouteOptimizationIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const green = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Route Path line drawing itself */}
      <motion.path
        d="M4 19C7 19 8 13 12 13C16 13 17 5 20 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Route Waypoints */}
      <circle cx="4" cy="19" r="2.5" fill={green} />
      <circle cx="12" cy="13" r="2.5" fill={color} />
      <circle cx="20" cy="5" r="2.5" fill={green} />

      {/* Moving tracer dot along path */}
      <motion.circle
        cx="4"
        cy="19"
        r="3"
        fill={green}
        animate={isHovered ? {
          cx: [4, 12, 20],
          cy: [19, 13, 5],
          scale: [1, 1.3, 1]
        } : { cx: 4, cy: 19 }}
        transition={{ duration: 1.6, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
      />
    </svg>
  );
};

export const CollectionsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const wheelColor = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <motion.g
        animate={isHovered ? { x: [-1, 2, -1] } : { x: 0 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
      >
        {/* Truck Cabin & Bed */}
        <path d="M2 5H14V17H2V5Z" stroke={color} strokeWidth="1.8" />
        <path d="M14 9H18L21 13V17H14V9Z" stroke={color} strokeWidth="1.8" />

        {/* Wheels rotating */}
        <motion.circle
          cx="6"
          cy="18"
          r="2.5"
          fill={wheelColor}
          animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
          style={{ originX: '6px', originY: '18px' }}
        />
        <motion.circle
          cx="17"
          cy="18"
          r="2.5"
          fill={wheelColor}
          animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
          style={{ originX: '17px', originY: '18px' }}
        />
      </motion.g>
    </svg>
  );
};

export const UserManagementIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const green = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {/* Left person */}
      <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.8" />
      <path d="M3 19C3 15.5 5.5 13 9 13C12.5 13 15 15.5 15 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* Right person popping in */}
      <motion.g
        animate={isHovered ? { y: [0, -2, 0], opacity: [0.7, 1, 0.7] } : { y: 0, opacity: 0.8 }}
        transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
      >
        <circle cx="17" cy="8" r="2.2" stroke={green} strokeWidth="1.6" />
        <path d="M14 19C14.2 16.5 15.5 14.5 18 14.5C20.5 14.5 22 16.5 22 19" stroke={green} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
};

export const CitizenPortalIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const green = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <path d="M12 21A9 9 0 1 0 12 3A9 9 0 0 0 12 21Z" stroke={color} strokeWidth="1.8" />
      <path d="M12 7V13" stroke={green} strokeWidth="2" strokeLinecap="round" />
      <motion.circle
        cx="12"
        cy="17"
        r="1.2"
        fill={green}
        animate={isHovered ? { scale: [1, 1.8, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const ReportsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const green = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Document lines drawing themselves */}
      <motion.line
        x1="8"
        y1="13"
        x2="16"
        y2="13"
        stroke={green}
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={{ pathLength: 1 }}
        animate={isHovered ? { pathLength: [0.2, 1, 0.2] } : { pathLength: 1 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
      />
      <motion.line
        x1="8"
        y1="17"
        x2="13"
        y2="17"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={{ pathLength: 1 }}
        animate={isHovered ? { pathLength: [0.4, 1, 0.4] } : { pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.2, repeat: isHovered ? Infinity : 0 }}
      />
    </svg>
  );
};

export const AuditLogsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';
  const green = '#22C55E';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <path d="M12 22S4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d="M9 12L11 14L15 10"
        stroke={green}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={isHovered ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.9, repeat: isHovered ? Infinity : 0 }}
        style={{ originX: '12px', originY: '12px' }}
      />
    </svg>
  );
};

export const SettingsIcon: React.FC<IconProps> = ({ isHovered, isActive }) => {
  const color = isActive ? '#FFFFFF' : '#166534';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      <motion.g
        animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
        style={{ originX: '12px', originY: '12px' }}
      >
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
        <path
          d="M19.4 15A1.65 1.65 0 0 0 19.7 17.5L20.8 19.4A1.65 1.65 0 0 1 18.7 21.6L16.8 20.5A1.65 1.65 0 0 0 14.3 20.8A1.65 1.65 0 0 0 13 22H11A1.65 1.65 0 0 0 9.7 20.8A1.65 1.65 0 0 0 7.2 20.5L5.3 21.6A1.65 1.65 0 0 1 3.2 19.4L4.3 17.5A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.4 13.7L2.2 13A1.65 1.65 0 0 1 2.2 11L3.4 10.3A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4.3 6.5L3.2 4.6A1.65 1.65 0 0 1 5.3 2.4L7.2 3.5A1.65 1.65 0 0 0 9.7 3.2A1.65 1.65 0 0 0 11 2H13A1.65 1.65 0 0 0 14.3 3.2A1.65 1.65 0 0 0 16.8 3.5L18.7 2.4A1.65 1.65 0 0 1 20.8 4.6L19.7 6.5A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 20.6 10.3L21.8 11A1.65 1.65 0 0 1 21.8 13L20.6 13.7A1.65 1.65 0 0 0 19.4 15Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
};

