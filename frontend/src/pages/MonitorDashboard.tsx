import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Download,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SmartBin, CollectionTask, Complaint } from '../types';
import { TaskStatusBadge } from '../components/common/StatusBadge';

export const MonitorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [binList, taskList, anData, compList] = await Promise.all([
          api.getBins(user?.municipality_id || 1),
          api.getTasks(),
          api.getAnalyticsOverview(user?.municipality_id || 1),
          api.getComplaints(),
        ]);
        if (!isMounted) return;
        setBins(binList);
        setTasks(taskList);
        setAnalytics(anData);
        setComplaints(compList);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    // Setup realtime subscription for monitoring updates
    const unsubscribe = api.subscribeToBins?.(() => {
      loadData();
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

  const criticalBins = bins.filter(b => b.status === 'CRITICAL' || b.fill_level >= 85);
  const pendingComplaints = complaints.filter(c => c.status !== 'RESOLVED');
  const recyclingEfficiency = analytics?.metrics?.recycling_efficiency_pct != null
    ? `${analytics.metrics.recycling_efficiency_pct}%`
    : '76.5%';
  const totalWasteTonnes = analytics?.metrics?.total_waste_collected_kg != null
    ? `${(analytics.metrics.total_waste_collected_kg / 1000).toFixed(1)} t`
    : '12.8 t';

  return (
    <div className="space-y-6">
      {/* Header Banner - Supervisory Read-Only Persona */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
              Auditor & Supervisory Observatory
            </span>
            <span className="text-xs text-slate-500 font-semibold">{user?.municipality_name}</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Municipal Environmental Audit & Monitoring Dashboard
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Supervise collection operations, verify segregation compliance, and inspect citizen grievance resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink
            to="/reports"
            className="px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Reports</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards (Requirement #11) */}
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
              title="Recycling Compliance"
              value={recyclingEfficiency}
              subtitle="Target 70% statutory"
              badge="Verified A+"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
            />
            <StatCard
              title="Gross Municipal Waste"
              value={totalWasteTonnes}
              subtitle="Total recorded tonnage"
              icon={<TrendingUp className="w-4 h-4 text-emerald-700" />}
            />
            <StatCard
              title="Bin Overflow Rate"
              value={`${criticalBins.length} Bins`}
              subtitle="Requiring supervisor review"
              badge={criticalBins.length > 0 ? 'Action Needed' : 'Nominal'}
              badgeColor={criticalBins.length > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            />
            <StatCard
              title="Citizen Grievances"
              value={pendingComplaints.length}
              subtitle="Active open complaints"
              badge="SLA: < 24 hrs"
              icon={<FileText className="w-4 h-4 text-purple-700" />}
            />
          </>
        )}
      </div>

      {/* Segregation & Area Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Generation Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17231C]">Area-Wise Waste Generation & Collection Rate</h3>
              <p className="text-xs text-[#747D75]">Tonnes generated vs % collection completed across municipal sectors</p>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
              Audit Period: Current Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.area_generation || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E7EBE7',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="volume_tonnes" name="Waste (Tonnes)" fill="#166534" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collection_pct" name="Collection %" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biodegradable vs Non-Biodegradable Segregation Split */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17231C]">Biodegradable vs Non-Biodegradable</h3>
            <p className="text-xs text-[#747D75]">Primary segregation audit balance</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.segregation_split || [
                    { name: 'Biodegradable', percentage: 57.0, color: '#22C55E' },
                    { name: 'Non-Biodegradable', percentage: 43.0, color: '#64748B' }
                  ]}
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="percentage"
                >
                  {(analytics?.segregation_split || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <span className="font-semibold text-slate-800">Biodegradable Organic</span>
              </div>
              <span className="font-bold text-slate-900">57.0%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
                <span className="font-semibold text-slate-800">Non-Biodegradable Recyclables</span>
              </div>
              <span className="font-bold text-slate-900">43.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supervision Feeds: Citizen Grievances & Live Collection Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citizen Complaints Review */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-bold text-[#17231C]">Citizen Grievance Ledger</h3>
            </div>
            <span className="text-xs text-slate-400">{complaints.length} total logged</span>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">{c.ticket_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mt-1">{c.complaint_type}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-200/50">
                  <span>{c.location_name}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Collection Progress Feed */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-[#17231C]">Live Collection Activity Feed</h3>
            </div>
            <NavLink to="/map" className="text-xs text-emerald-700 font-semibold hover:underline">
              GIS Observation &rarr;
            </NavLink>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-[#F5F6F4] border border-[#E7EBE7] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.task_code}</span>
                    <TaskStatusBadge status={t.status} />
                  </div>
                  <p className="text-slate-600 font-medium mt-1">
                    Collector: {t.collector_name} • {t.area_name}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(t.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

