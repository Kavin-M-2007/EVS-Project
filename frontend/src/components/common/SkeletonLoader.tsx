import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading operational telemetry...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg animate-pulse">
          E
        </div>
        <div className="absolute inset-0 border-2 border-emerald-600 border-t-transparent rounded-2xl animate-spin" />
      </div>
      <p className="text-xs font-semibold text-[#17231C] tracking-wide">{message}</p>
      <span className="text-[10px] text-[#747D75] mt-1">EcoSort AI Platform</span>
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-[#E7EBE7] space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-20 h-3 bg-slate-200 rounded-full" />
            <div className="w-7 h-7 bg-slate-100 rounded-xl" />
          </div>
          <div className="w-28 h-7 bg-slate-200 rounded-lg" />
          <div className="w-36 h-2.5 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="w-32 h-4 bg-slate-200 rounded-md" />
        <div className="w-24 h-4 bg-slate-100 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="space-y-1.5">
              <div className="w-28 h-3 bg-slate-200 rounded-full" />
              <div className="w-36 h-2 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="w-16 h-3 bg-slate-100 rounded-full" />
          <div className="w-20 h-5 bg-slate-100 rounded-full" />
          <div className="w-16 h-6 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

