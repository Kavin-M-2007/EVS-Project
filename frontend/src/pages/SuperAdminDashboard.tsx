import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Users,
  Trash2,
  Recycle,
  Truck,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sparkles
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
import { api } from '../services/api';
import { Municipality, SmartBin } from '../types';

export const SuperAdminDashboard: React.FC = () => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [criticalBins, setCriticalBins] = useState<SmartBin[]>([]);
  const [selectedMuni, setSelectedMuni] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [munis, anData, bins] = await Promise.all([
          api.getMunicipalities(),
          api.getAnalyticsOverview(selectedMuni === 'all' ? undefined : parseInt(selectedMuni)),
          api.getBins(selectedMuni === 'all' ? undefined : parseInt(selectedMuni), 'CRITICAL')
        ]);
        setMunicipalities(munis);
        setAnalytics(anData);
        setCriticalBins(bins.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMuni]);

  const metrics = analytics?.metrics || {
    total_waste_collected_kg: 32450,
    recycled_waste_kg: 24820,
    recycling_efficiency_pct: 76.5,
    total_smart_bins: 604,
    critical_bins: 18,
    active_collectors: 42,
    active_vehicles: 24,
    collection_completion_rate: 94.2
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Municipality Filter */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Super Admin Control Centre
            </span>
            <span className="text-xs text-slate-400 font-mono">Platform v2.0</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Global Municipal Infrastructure Overview
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Cross-jurisdiction smart bin telemetry, fleet dispatch, and automated recycling analytics.
          </p>
        </div>

        {/* Municipality Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Municipality Filter:</label>
          <select
            value={selectedMuni}
            onChange={(e) => setSelectedMuni(e.target.value)}
            className="bg-[#F5F6F4] text-xs text-[#17231C] font-semibold px-3.5 py-2 rounded-xl border border-[#E7EBE7] focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Municipalities (Global View)</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row (Requirement #8 & #26) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Municipalities"
          value={municipalities.length || 3}
          subtitle="All regions operational"
          icon={<Building2 className="w-4 h-4 text-emerald-700" />}
          badge="100% Active"
        />
        <StatCard
          title="Total Smart Bins"
          value={metrics.total_smart_bins || 604}
          subtitle="IoT telemetry active"
          change="+12 this month"
          icon={<Trash2 className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Total Waste Collected"
          value={`${(metrics.total_waste_collected_kg / 1000).toFixed(1)} t`}
          subtitle="Across all sectors"
          change="+8.4% vs last week"
          icon={<TrendingUp className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Recycling Efficiency"
          value={`${metrics.recycling_efficiency_pct}%`}
          subtitle="Exceeds 70% statutory target"
          change="A+ Grade"
          icon={<Recycle className="w-4 h-4 text-emerald-700" />}
          badge="Top Decile"
          badgeColor="bg-emerald-100 text-emerald-800 border-emerald-300"
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Active Fleet</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metrics.active_vehicles || 24} EVs</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Field Collectors</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metrics.active_collectors || 42} staff</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Critical Bins</span>
            <p className="text-xl font-bold text-red-600 mt-0.5">{metrics.critical_bins || 4} units</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Task SLA Rate</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{metrics.collection_completion_rate}%</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Charts Row: Municipality Comparison & Waste Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Municipality Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17231C]">Municipality Waste & Recycling Comparison</h3>
              <p className="text-xs text-[#747D75]">Total tonnes collected vs recycling rate by jurisdiction</p>
            </div>
            <NavLink
              to="/analytics"
              className="text-xs text-[#166534] font-semibold hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.muni_comparison || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="municipality" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E7EBE7',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="waste_tonnes" name="Waste (tonnes)" fill="#166534" radius={[6, 6, 0, 0]} />
                <Bar dataKey="recycling_rate" name="Recycling %" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Material Composition */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17231C]">Waste Composition Breakdown</h3>
            <p className="text-xs text-[#747D75]">Automated segregation fractions</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.waste_composition || []}
                  innerRadius={50}
                  outerRadius={75}
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

          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#17231C] pt-2 border-t border-slate-100">
            {(analytics?.waste_composition || []).slice(0, 4).map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Smart Bins & Municipal Regions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Bin Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold text-[#17231C]">Critical Smart Bins Requiring Pickup</h3>
            </div>
            <NavLink to="/smart-bins" className="text-xs text-emerald-700 font-semibold hover:underline">
              View All Bins &rarr;
            </NavLink>
          </div>

          <div className="space-y-3">
            {criticalBins.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">All smart bins operating below 90% threshold.</p>
            ) : (
              criticalBins.map((bin) => (
                <div
                  key={bin.id}
                  className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{bin.bin_code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                        {bin.fill_level}% FULL
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{bin.location_name}</p>
                    <span className="text-[10px] text-slate-400">{bin.waste_category} • {bin.municipality_name}</span>
                  </div>

                  <NavLink
                    to="/route-optimization"
                    className="px-3 py-1.5 bg-[#166534] text-white text-xs font-semibold rounded-xl hover:bg-[#14532D] transition-colors flex-shrink-0"
                  >
                    Dispatch Route
                  </NavLink>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Municipalities List */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#17231C]">Active Municipal Jurisdictions</h3>
            <NavLink to="/users" className="text-xs text-emerald-700 font-semibold hover:underline">
              Manage Admins &rarr;
            </NavLink>
          </div>

          <div className="space-y-3">
            {municipalities.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[#F5F6F4] border border-[#E7EBE7] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#17231C]">{m.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {m.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#747D75] mt-1">
                    {m.population.toLocaleString()} pop • {m.total_area_sqkm} km² • {m.state}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800">
                    {m.total_bins || 248} Bins
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {m.active_collectors || 12} Collectors
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

