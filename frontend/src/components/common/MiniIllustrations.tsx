import React from 'react';
import { motion } from 'framer-motion';

export const MiniBinsIllustration: React.FC = () => (
  <div className="w-16 h-14 bg-emerald-50 rounded-lg flex items-center justify-center p-1 relative overflow-hidden border border-emerald-100">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="10" y="12" width="20" height="22" rx="3" fill="#FFFFFF" stroke="#166534" strokeWidth="1.5" />
      {/* Fill indicator */}
      <motion.rect
        x="13"
        y="22"
        width="14"
        height="10"
        rx="2"
        fill="#22C55E"
        animate={{ height: [6, 14, 6], y: [26, 18, 26] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bin Lid */}
      <motion.path
        d="M8 12H32"
        stroke="#166534"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ y: [-1, -3, -1], rotate: [-2, -6, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Signal */}
      <circle cx="20" cy="7" r="1.5" fill="#166534" />
      <motion.path
        d="M17 5C19 3.5 21 3.5 23 5"
        stroke="#22C55E"
        strokeWidth="1.2"
        strokeLinecap="round"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    </svg>
  </div>
);

export const MiniScannerIllustration: React.FC = () => (
  <div className="w-16 h-14 bg-emerald-50 rounded-lg flex items-center justify-center p-1 relative overflow-hidden border border-emerald-100">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="8" width="24" height="24" rx="4" stroke="#166534" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="20" cy="20" r="5" fill="#DCFCE7" stroke="#166534" strokeWidth="1.2" />
      {/* Laser sweep */}
      <motion.line
        x1="8"
        y1="12"
        x2="32"
        y2="12"
        stroke="#22C55E"
        strokeWidth="2"
        animate={{ y1: [10, 30, 10], y2: [10, 30, 10] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

export const MiniRouteIllustration: React.FC = () => (
  <div className="w-16 h-14 bg-emerald-50 rounded-lg flex items-center justify-center p-1 relative overflow-hidden border border-emerald-100">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M8 30C14 30 14 18 22 18C28 18 28 10 34 10" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="2 2" />
      <motion.path
        d="M8 30C14 30 14 18 22 18C28 18 28 10 34 10"
        stroke="#166534"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="8" cy="30" r="2.5" fill="#22C55E" />
      <circle cx="22" cy="18" r="2.5" fill="#166534" />
      <circle cx="34" cy="10" r="2.5" fill="#22C55E" />
      {/* Moving truck dot */}
      <motion.circle
        r="3.5"
        fill="#22C55E"
        animate={{
          cx: [8, 22, 34],
          cy: [30, 18, 10]
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

export const MiniAnalyticsIllustration: React.FC = () => (
  <div className="w-16 h-14 bg-emerald-50 rounded-lg flex items-center justify-center p-1 relative overflow-hidden border border-emerald-100">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <motion.rect
        x="8"
        y="22"
        width="5"
        height="12"
        rx="1"
        fill="#166534"
        animate={{ height: [8, 16, 8], y: [26, 18, 26] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.rect
        x="16"
        y="14"
        width="5"
        height="20"
        rx="1"
        fill="#22C55E"
        animate={{ height: [12, 22, 12], y: [22, 12, 22] }}
        transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.rect
        x="24"
        y="10"
        width="5"
        height="24"
        rx="1"
        fill="#166534"
        animate={{ height: [16, 26, 16], y: [18, 8, 18] }}
        transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

export const MiniPredictionsIllustration: React.FC = () => (
  <div className="w-16 h-14 bg-emerald-50 rounded-lg flex items-center justify-center p-1 relative overflow-hidden border border-emerald-100">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="10" cy="12" r="3" fill="#166534" />
      <circle cx="10" cy="28" r="3" fill="#166534" />
      <motion.circle
        cx="20"
        cy="20"
        r="4"
        fill="#22C55E"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <circle cx="30" cy="12" r="3" fill="#166534" />
      <circle cx="30" cy="28" r="3" fill="#166534" />
      <line x1="10" y1="12" x2="20" y2="20" stroke="#166534" strokeWidth="1.2" />
      <line x1="10" y1="28" x2="20" y2="20" stroke="#166534" strokeWidth="1.2" />
      <line x1="20" y1="20" x2="30" y2="12" stroke="#22C55E" strokeWidth="1.5" />
      <line x1="20" y1="20" x2="30" y2="28" stroke="#22C55E" strokeWidth="1.5" />
    </svg>
  </div>
);

export const MiniDefaultIllustration: React.FC<{ label: string }> = ({ label }) => (
  <div className="w-16 h-14 bg-emerald-50 rounded-lg flex items-center justify-center p-1 border border-emerald-100 text-xs font-semibold text-emerald-800">
    {label.slice(0, 4)}
  </div>
);

