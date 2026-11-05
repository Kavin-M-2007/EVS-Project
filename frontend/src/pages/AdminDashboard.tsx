import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Trash2,
  Recycle,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SmartBin, CollectionTask } from '../types';
import { TaskStatusBadge, PriorityBadge } from '../components/common/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [binList, taskList, anData] = await Promise.all([
          api.getBins(user?.municipality_id || 1),
          api.getTasks(),
          api.getAnalyticsOverview(user?.municipality_id || 1),
        ]);
        setBins(binList);
        setTasks(taskList);
        setAnalytics(anData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const overflowingBins = bins.filter((b) => b.status === 'CRITICAL' || b.fill_level >= 85);
  const pendingTasks = tasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Municipal Operations Hub
            </span>
            <span className="text-xs text-slate-500 font-semibold">{user?.municipality_name}</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Real-Time Sector Operations & Waste Fleet
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Manage daily collector schedules, monitor smart bin fill rates and dispatch urgent collection teams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink
            to="/collections"
            className="px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Collection Task</span>
          </NavLink>
          <NavLink
            to="/ai-scanner"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-semibold rounded-xl border border-emerald-200 transition-all"
          >
            AI Waste Scanner
          </NavLink>
        </div>
      </div>

      {/* Primary KPI Cards (Requirement #9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Waste Collected"
          value="12.8 t"
          subtitle="This week in Peelamedu, Coimbatore"
          change="+6.2%"
          icon={<Trash2 className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Recycling Rate"
          value="76.5%"
          subtitle="8.4 tonnes diverted"
          badge="A Grade"
          icon={<Recycle className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Active Smart Bins"
          value={bins.length || 248}
          subtitle={`${overflowingBins.length} requiring immediate pickup`}
          icon={<AlertTriangle className={`w-4 h-4 ${overflowingBins.length > 0 ? 'text-red-500' : 'text-emerald-700'}`} />}
          badge={overflowingBins.length > 0 ? `${overflowingBins.length} Critical` : 'All OK'}
          badgeColor={overflowingBins.length > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
        />
        <StatCard
          title="Collection Completion"
          value="94.2%"
          subtitle="Daily SLA adherence"
          change="32 of 34 tasks done"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
        />
      </div>

      {/* Fleet & Personnel Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Active Collectors</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">18 On Duty</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Active Vehicles</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">8 EV Compactors</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Pending Tasks</span>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{pendingTasks.length} in queue</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Complaints Open</span>
            <p className="text-xl font-bold text-purple-700 mt-0.5">2 Tickets</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Middle Row: Waste Generation Trend & Critical Overflow Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17231C]">Daily Waste Collection & Recycling Trend</h3>
              <p className="text-xs text-[#747D75]">Last 7 days kilograms collected vs diverted</p>
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 font-medium px-2.5 py-1 rounded-full border border-emerald-200">
              Target: 70% Diversion
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.daily_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="collected_kg" name="Collected (kg)" stroke="#166534" fillOpacity={1} fill="url(#colorCollected)" strokeWidth={2} />
                <Area type="monotone" dataKey="recycled_kg" name="Recycled (kg)" stroke="#22C55E" fillOpacity={1} fill="url(#colorRecycled)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overflowing Bins Action Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17231C]">High Priority Fill Alerts</h3>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {overflowingBins.length} Alerting
              </span>
            </div>
            <p className="text-xs text-[#747D75] mt-1">Smart bins requiring route optimization</p>

            <div className="space-y-3 mt-4">
              {overflowingBins.slice(0, 3).map((b) => (
                <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{b.bin_code}</span>
                    <span className="text-red-600 font-bold">{b.fill_level}% Full</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{b.location_name}</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${b.fill_level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <NavLink
            to="/route-optimization"
            className="w-full mt-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Optimize Collection Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Bottom Row: Active Collection Tasks Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#17231C]">Today's Collection Operations</h3>
            <p className="text-xs text-[#747D75]">Status updates directly synced from collector handheld devices</p>
          </div>
          <NavLink to="/collections" className="text-xs text-emerald-700 font-semibold hover:underline">
            Manage All Tasks &rarr;
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EBE7] text-[#747D75] font-semibold">
                <th className="pb-3">Task Code</th>
                <th className="pb-3">Area / Sector</th>
                <th className="pb-3">Collector</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Workflow Status</th>
                <th className="pb-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tasks.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-900">{t.task_code}</td>
                  <td className="py-3">{t.area_name}</td>
                  <td className="py-3 font-semibold text-slate-900">{t.collector_name}</td>
                  <td className="py-3 text-slate-500 font-mono">{t.vehicle_plate}</td>
                  <td className="py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="py-3">
                    <TaskStatusBadge status={t.status} />
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    {new Date(t.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

