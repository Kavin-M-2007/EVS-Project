import React, { useEffect, useState } from 'react';
import {
  Route,
  Navigation,
  CheckCircle2,
  ArrowRight,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SmartBin, RouteOptimizationResult, User } from '../types';

export const RouteOptimizationPage: React.FC = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [collectors, setCollectors] = useState<User[]>([]);
  const [selectedBinIds, setSelectedBinIds] = useState<(string | number)[]>([]);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string | number | ''>('');
  const [optResult, setOptResult] = useState<RouteOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState('');
  const [optError, setOptError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      try {
        const [binList, userList] = await Promise.all([
          api.getBins(user?.municipality_id || 1),
          api.getUsers('GARBAGE_COLLECTOR', user?.municipality_id || 1),
        ]);
        setBins(binList);
        setCollectors(userList);
        // Default select all critical and near full bins
        const urgent = binList.filter(b => b.status === 'CRITICAL' || b.fill_level >= 75).map(b => b.id);
        setSelectedBinIds(urgent.length > 0 ? urgent : binList.slice(0, 5).map(b => b.id));
        if (userList.length > 0) {
          setSelectedCollectorId(userList[0].id);
        }
      } catch (e: any) {
        console.error(e);
        setOptError(e.message || 'Failed to initialize fleet data.');
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [user]);

  const toggleBinSelection = (id: string | number) => {
    if (selectedBinIds.includes(id)) {
      setSelectedBinIds(selectedBinIds.filter(b => b !== id));
    } else {
      setSelectedBinIds([...selectedBinIds, id]);
    }
  };

  const handleSelectAllCritical = () => {
    const criticals = bins.filter(b => b.fill_level >= 75).map(b => b.id);
    setSelectedBinIds(criticals);
  };

  const handleOptimizeRoute = async () => {
    if (selectedBinIds.length === 0) {
      setOptError('Please select at least one smart bin to include in the route.');
      setTimeout(() => setOptError(''), 4000);
      return;
    }

    setIsOptimizing(true);
    setAssignedMessage('');
    setOptError('');

    try {
      const res = await api.optimizeRoute({
        municipality_id: user?.municipality_id || 1,
        bin_ids: selectedBinIds,
        collector_id: selectedCollectorId ? selectedCollectorId : undefined
      });
      setOptResult(res);
    } catch (e: any) {
      setOptError(e.message || 'Route calculation failed.');
      setTimeout(() => setOptError(''), 5000);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAssignTask = async () => {
    if (!optResult || !selectedCollectorId) {
      setOptError('Please select an active collector to assign this route.');
      setTimeout(() => setOptError(''), 4000);
      return;
    }

    setOptError('');
    try {
      await api.createTask({
        municipality_id: user?.municipality_id || 1,
        collector_id: selectedCollectorId,
        area_name: 'Optimized Peelamedu Collection Tour',
        priority: 'HIGH',
        notes: `Auto-generated TSP tour for ${optResult.total_bins} bins. Estimated duration: ${optResult.estimated_time_minutes} mins.`
      });
      setAssignedMessage('Tour assigned successfully to collector! Task dispatched.');
      setTimeout(() => setAssignedMessage(''), 5000);
    } catch (e: any) {
      setOptError(e.message || 'Task assignment failed.');
      setTimeout(() => setOptError(''), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Heuristic TSP Routing
            </span>
            <span className="text-xs text-slate-400 font-mono">2-Opt Optimization</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Intelligent Collection Route Optimization
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Compute optimal shortest-path collection loops, minimize transit fuel, and dispatch direct tasks.
          </p>
        </div>

        <button
          onClick={handleSelectAllCritical}
          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold rounded-xl border border-red-200 transition-colors"
        >
          Select All Critical &gt; 75%
        </button>
      </div>

      {assignedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{assignedMessage}</span>
        </motion.div>
      )}

      {/* Main Grid: Parameters & Bin Selector on Left, Route Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selection Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#17231C]">Select Smart Bins for Route</h3>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {selectedBinIds.length} Selected
            </span>
          </div>

          {/* Bin Checklist */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {bins.map((bin) => (
              <label
                key={bin.id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedBinIds.includes(bin.id)}
                  onChange={() => toggleBinSelection(bin.id)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{bin.bin_code}</span>
                    <span className={`font-semibold ${bin.fill_level >= 85 ? 'text-red-600' : 'text-slate-600'}`}>
                      {bin.fill_level}% Full
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{bin.location_name}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Assigned Collector & Vehicle */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign to Active Collector:
              </label>
              <select
                value={selectedCollectorId}
                onChange={(e) => setSelectedCollectorId(e.target.value || '')}
                className="w-full bg-[#F5F6F4] text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              >
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.employee_id}) • {c.assigned_area || 'Central'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || selectedBinIds.length === 0}
              className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 disabled:opacity-50 transition-all"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing Nearest Neighbor Tour...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Solve Optimal Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Route Optimization Result & Comparison (Requirement #19) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#17231C]">Optimized Tour Waypoints</h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {optResult?.algorithm_used || '2-Opt TSP'}
              </span>
            </div>

            {optResult ? (
              <div className="space-y-4 my-4">
                {/* Distance & Time Saved Comparison Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase">Transit Distance</span>
                    <p className="text-lg font-bold text-emerald-950 mt-0.5">{optResult.estimated_distance_km} km</p>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Saved {optResult.distance_saved_km} km vs standard
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-semibold text-blue-800 uppercase">Est. Mission Time</span>
                    <p className="text-lg font-bold text-blue-950 mt-0.5">{optResult.estimated_time_minutes} mins</p>
                    <span className="text-[10px] text-blue-700 font-medium">
                      Saved ~{optResult.time_saved_minutes} mins turnaround
                    </span>
                  </div>
                </div>

                {/* Ordered Stops List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Sequential Stop Sequence:</h4>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {optResult.waypoints.map((wp) => (
                      <div
                        key={wp.order}
                        className="p-2.5 rounded-xl bg-[#F5F6F4] text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#166534] text-white font-bold text-[10px] flex items-center justify-center">
                            {wp.order}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-slate-900">{wp.bin_code}</span>
                            <p className="text-[11px] text-slate-600 truncate">{wp.location_name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">
                          {wp.fill_level}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <Route className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">Select smart bins and tap "Solve Optimal Route".</p>
              </div>
            )}
          </div>

          {optResult && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleAssignTask}
                className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Assign Tour as Collection Task</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

