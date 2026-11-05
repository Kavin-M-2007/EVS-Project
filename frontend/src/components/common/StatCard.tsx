import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  badge,
  badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl p-5 border border-[#E7EBE7] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-[#747D75] uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#F5F6F4] text-[#166534] flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#17231C] tracking-tight">{value}</span>
          {badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        {(change || subtitle) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#747D75]">
            {change && (
              <span className={`font-semibold ${isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
                {change}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

