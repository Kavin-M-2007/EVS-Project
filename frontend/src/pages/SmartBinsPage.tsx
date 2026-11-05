import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Search,
  Filter,
  Battery,
  Thermometer,
  Weight,
  Clock,
  MapPin,
  RefreshCw,
  Plus,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { SmartBin } from '../types';
import { BinStatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const SmartBinsPage: React.FC = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [binDetails, setBinDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBins = async () => {
    try {
      const data = await api.getBins(
        user?.role === 'SUPER_ADMIN' ? undefined : (user?.municipality_id || 1),
        statusFilter === 'all' ? undefined : statusFilter,
        categoryFilter === 'all' ? undefined : categoryFilter
      );
      setBins(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, [statusFilter, categoryFilter, user]);

  const handleSelectBin = async (b: SmartBin) => {
    setSelectedBin(b);
    try {
      const details = await api.getBinDetails(b.id);
      setBinDetails(details);
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate updating bin fill level (e.g. testing sensor telemetry surge)
  const handleSimulateFill = async (newFill: number) => {
    if (!selectedBin) return;
    setIsUpdating(true);
    try {
      await api.updateBinTelemetry(selectedBin.id, {
        fill_level: newFill,
        temperature_c: selectedBin.temperature_c + 0.5,
        weight_kg: Math.round(newFill * 0.4)
      });
      await fetchBins();
      const updatedDetails = await api.getBinDetails(selectedBin.id);
      setBinDetails(updatedDetails);
      setSelectedBin(updatedDetails.bin);
    } catch (e: any) {
      alert(e.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBins = bins.filter((b) =>
    b.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.waste_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              IoT Sensor Fleet
            </span>
            <span className="text-xs text-slate-400 font-mono">{bins.length} Active Nodes</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Smart Waste Bins & Telemetry Management
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Ultrasonic depth sensors, internal temperature, load cells and solar battery monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBins}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, street, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F6F4] text-xs text-[#17231C] pl-8 pr-3 py-2 rounded-xl border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Fill Statuses</option>
            <option value="NORMAL">Normal (&lt; 70%)</option>
            <option value="NEAR_FULL">Near Full (70–89%)</option>
            <option value="CRITICAL">Critical (&gt;= 90%)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Waste Streams</option>
            <option value="Plastic">Plastic</option>
            <option value="Organic">Organic</option>
            <option value="Paper & Cardboard">Paper & Cardboard</option>
            <option value="Metal & Cans">Metal</option>
            <option value="Mixed Waste">Mixed Waste</option>
          </select>
        </div>
      </div>

      {/* Grid of Smart Bins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBins.map((bin) => (
          <div
            key={bin.id}
            onClick={() => handleSelectBin(bin)}
            className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              selectedBin?.id === bin.id
                ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                : 'border-[#E7EBE7]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900">{bin.bin_code}</span>
                <h4 className="text-xs font-bold text-slate-800 mt-0.5">{bin.location_name}</h4>
                <span className="text-[10px] text-slate-400">{bin.waste_category} • {bin.municipality_name}</span>
              </div>
              <BinStatusBadge status={bin.status} />
            </div>

            {/* Fill Level Meter Bar (Requirement #15) */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Ultrasonic Fill Level</span>
                <span className={bin.fill_level >= 85 ? 'text-red-600' : 'text-slate-800'}>
                  {Math.round(bin.fill_level)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    bin.status === 'CRITICAL'
                      ? 'bg-red-500'
                      : bin.status === 'NEAR_FULL'
                      ? 'bg-amber-500'
                      : 'bg-[#22C55E]'
                  }`}
                  style={{ width: `${bin.fill_level}%` }}
                />
              </div>
            </div>

            {/* Sensor Quick Stats */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                <span>{bin.battery_level}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>{bin.temperature_c}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-slate-600" />
                <span>{bin.weight_kg} kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Bin Drawer / Modal (Requirement #15) */}
      <AnimatePresence>
        {selectedBin && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedBin.bin_code}
                    </span>
                    <BinStatusBadge status={selectedBin.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedBin.location_name}</h3>
                  <p className="text-xs text-slate-500">{selectedBin.waste_category} • {selectedBin.municipality_name}</p>
                </div>
                <button
                  onClick={() => setSelectedBin(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Sensor Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Fill Depth</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedBin.fill_level}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Internal Temp</span>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">{selectedBin.temperature_c}°C</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Solar Battery</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{selectedBin.battery_level}%</p>
                </div>
              </div>

              {/* Recent Sensor Telemetry Logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Hourly Telemetry Curve</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(binDetails?.sensor_telemetry_history || []).map((reading: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-[#F5F6F4] text-[11px] flex items-center justify-between text-slate-600"
                    >
                      <span className="font-mono">{reading.recorded_at}</span>
                      <span className="font-semibold text-slate-800">{reading.fill_percentage}% Fill</span>
                      <span>{reading.temperature_c}°C</span>
                      <span className="font-mono text-slate-400">{reading.weight_kg} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Simulation Controls */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Simulation & Operator Override:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSimulateFill(15)}
                    disabled={isUpdating}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200"
                  >
                    Simulate 15% (Empty)
                  </button>
                  <button
                    onClick={() => handleSimulateFill(75)}
                    disabled={isUpdating}
                    className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200"
                  >
                    Simulate 75%
                  </button>
                  <button
                    onClick={() => handleSimulateFill(95)}
                    disabled={isUpdating}
                    className="py-2 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold rounded-xl border border-red-200"
                  >
                    Trigger 95% Overflow
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

