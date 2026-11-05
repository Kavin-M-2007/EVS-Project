import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, Recycle, TrendingUp, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { CardSkeleton } from '../components/common/SkeletonLoader';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await api.getAnalyticsOverview(
          user?.role === 'SUPER_ADMIN' ? undefined : (user?.municipality_id || 1)
        );
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);

  const metrics = analytics?.metrics || {
    total_waste_collected_kg: 32450,
    recycled_waste_kg: 24820,
    recycling_efficiency_pct: 76.5,
    collection_completion_rate: 94.2
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Environmental Performance
            </span>
            <span className="text-xs text-slate-400 font-mono">Aggregated Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Waste Generation, Diversion & Recycling Metrics
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Operational trends, statutory recycling quotas, and area generation diagnostics.
          </p>
        </div>

        {/* Time Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F5F6F4] p-1 rounded-2xl flex items-center border border-[#E7EBE7]">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Quarterly'}
              </button>
            ))}
          </div>

          <a
            href="/api/reports/export-csv?report_type=daily"
            download
            className="px-3.5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Gross Tonnage"
              value={`${(metrics.total_waste_collected_kg / 1000).toFixed(1)} t`}
              subtitle="Net municipal intake"
              change="+6.2%"
              icon={<TrendingUp className="w-4 h-4 text-emerald-700" />}
            />
            <StatCard
              title="Recycled Volume"
              value={`${(metrics.recycled_waste_kg / 1000).toFixed(1)} t`}
              subtitle="Diverted from landfill"
              change="+8.9%"
              icon={<CheckCircle className="w-4 h-4 text-emerald-700" />}
            />
            <StatCard
              title="Recycling Efficiency"
              value={`${metrics.recycling_efficiency_pct}%`}
              subtitle="Statutory threshold 70%"
              badge="Exceeding Target"
              icon={<Recycle className="w-4 h-4 text-emerald-700" />}
            />
            <StatCard
              title="Collection SLA Adherence"
              value={`${metrics.collection_completion_rate}%`}
              subtitle="Completed on schedule"
              badge="Gold Standard"
              badgeColor="bg-emerald-100 text-emerald-800 border-emerald-300"
              icon={<CheckCircle className="w-4 h-4 text-emerald-700" />}
            />
          </>
        )}
      </div>

      {/* Trend Line Chart */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#17231C]">Daily Waste Collection vs Recycling Target</h3>
            <p className="text-xs text-[#747D75]">Comparative performance curve across operational days</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
              <span className="text-slate-600">Gross Collected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-slate-600">Diverted Recycled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-400" />
              <span className="text-slate-400">Target</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.daily_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E7EBE7',
                  fontSize: '12px'
                }}
              />
              <Line type="monotone" dataKey="collected_kg" name="Gross Collected (kg)" stroke="#166534" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="recycled_kg" name="Recycled (kg)" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="target_kg" name="Target (kg)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Composition & Area Generation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Stream Categories */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <h3 className="text-sm font-bold text-[#17231C]">Waste Stream Composition</h3>
          <p className="text-xs text-[#747D75] mb-4">Detailed segregation categories</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.waste_composition || []}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(analytics?.waste_composition || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {(analytics?.waste_composition || []).map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 font-medium">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Area Generation Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <h3 className="text-sm font-bold text-[#17231C]">Sector Waste Generation Volumes</h3>
          <p className="text-xs text-[#747D75] mb-4">Tonnes generated across local zones</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.area_generation || []} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="area" type="category" tick={{ fontSize: 9 }} width={120} />
                <Tooltip />
                <Bar dataKey="volume_tonnes" name="Tonnes" fill="#166534" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

