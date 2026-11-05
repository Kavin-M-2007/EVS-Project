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
  Edit2,
  Trash,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { SmartBin, Sector } from '../types';
import { BinStatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const SmartBinsPage: React.FC = () => {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'fill_desc' | 'fill_asc' | 'code' | 'battery'>('fill_desc');
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [binDetails, setBinDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [binToEdit, setBinToEdit] = useState<SmartBin | null>(null);
  const [binToDelete, setBinToDelete] = useState<SmartBin | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState('Plastic');
  const [formLat, setFormLat] = useState('11.0260');
  const [formLng, setFormLng] = useState('77.0100');
  const [formCapacity, setFormCapacity] = useState('240');
  const [formSector, setFormSector] = useState('');
  const [formError, setFormError] = useState('');

  const canManage = isSuperAdmin || isAdmin;

  const fetchBins = async () => {
    try {
      const muniId = user?.role === 'SUPER_ADMIN' ? undefined : (user?.municipality_id || 1);
      const [binData, sectorData] = await Promise.all([
        api.getBins(
          muniId,
          statusFilter === 'all' ? undefined : statusFilter,
          categoryFilter === 'all' ? undefined : categoryFilter
        ),
        api.getSectors(muniId)
      ]);
      setBins(binData);
      setSectors(sectorData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, [statusFilter, categoryFilter, user]);

  // Supabase Realtime Subscription for Live Updates
  useEffect(() => {
    const unsubscribe = api.subscribeToBins((payload) => {
      fetchBins();
      if (selectedBin && payload.new && payload.new.id === selectedBin.id) {
        setSelectedBin((prev) => (prev ? { ...prev, ...payload.new } : null));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [selectedBin]);

  const handleSelectBin = async (b: SmartBin) => {
    setSelectedBin(b);
    try {
      const details = await api.getBinDetails(b.id);
      setBinDetails(details);
    } catch (e) {
      console.error(e);
    }
  };

  // Simulated Telemetry (Strictly badged as simulation)
  const handleSimulateFill = async (newFill: number) => {
    if (!selectedBin) return;
    setIsUpdating(true);
    try {
      await api.updateBinTelemetry(selectedBin.id, {
        fill_level: newFill,
        temperature_c: Number((selectedBin.temperature_c + 0.5).toFixed(1)),
        weight_kg: Math.round(newFill * 0.4)
      });
      await fetchBins();
      const updatedDetails = await api.getBinDetails(selectedBin.id);
      setBinDetails(updatedDetails);
      setSelectedBin(updatedDetails.bin);
      setActionSuccess(`[Simulated IoT Test] Fill level set to ${newFill}%`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e: any) {
      alert(e.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  // Add Bin Submit
  const handleCreateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formCode.trim() || !formLocation.trim()) {
      setFormError('Please provide both a Bin Code and Location.');
      return;
    }

    try {
      const newBin = await api.createBin({
        bin_code: formCode.trim().toUpperCase(),
        location_name: formLocation.trim(),
        waste_category: formCategory,
        latitude: parseFloat(formLat) || 11.0260,
        longitude: parseFloat(formLng) || 77.0100,
        max_capacity_liters: parseFloat(formCapacity) || 240,
        municipality_id: user?.municipality_id || 1,
        sector_id: formSector || undefined,
        fill_level: 0,
        status: 'NORMAL',
        battery_level: 100,
        temperature_c: 26.5,
        weight_kg: 0,
      });

      setIsAddModalOpen(false);
      setFormCode('');
      setFormLocation('');
      await fetchBins();
      setActionSuccess(`Smart Bin ${newBin.bin_code} registered in database.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create bin.');
    }
  };

  // Open Edit Modal
  const openEditModal = (bin: SmartBin) => {
    setBinToEdit(bin);
    setFormCode(bin.bin_code);
    setFormLocation(bin.location_name);
    setFormCategory(bin.waste_category);
    setFormLat(bin.latitude.toString());
    setFormLng(bin.longitude.toString());
    setFormCapacity(bin.max_capacity_liters.toString());
    setFormSector(bin.sector_id ? bin.sector_id.toString() : '');
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Edit Bin Submit
  const handleUpdateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!binToEdit) return;
    setFormError('');

    try {
      await api.updateBin(binToEdit.id, {
        bin_code: formCode.trim().toUpperCase(),
        location_name: formLocation.trim(),
        waste_category: formCategory,
        latitude: parseFloat(formLat) || binToEdit.latitude,
        longitude: parseFloat(formLng) || binToEdit.longitude,
        max_capacity_liters: parseFloat(formCapacity) || binToEdit.max_capacity_liters,
        sector_id: formSector || null,
      });

      setIsEditModalOpen(false);
      setBinToEdit(null);
      await fetchBins();
      if (selectedBin && selectedBin.id === binToEdit.id) {
        const updated = await api.getBinDetails(binToEdit.id);
        setBinDetails(updated);
        setSelectedBin(updated.bin);
      }
      setActionSuccess('Bin metadata updated successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update bin.');
    }
  };

  // Delete Bin Confirm
  const handleDeleteBin = async () => {
    if (!binToDelete) return;
    try {
      await api.deleteBin(binToDelete.id);
      setIsDeleteModalOpen(false);
      if (selectedBin?.id === binToDelete.id) {
        setSelectedBin(null);
      }
      setBinToDelete(null);
      await fetchBins();
      setActionSuccess('Bin record removed.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Could not delete bin.');
    }
  };

  // Filtering & Sorting
  let filteredBins = bins.filter((b) => {
    const matchesSearch =
      b.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.waste_category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || (b.sector_id && String(b.sector_id) === sectorFilter);
    return matchesSearch && matchesSector;
  });

  filteredBins.sort((a, b) => {
    if (sortBy === 'fill_desc') return b.fill_level - a.fill_level;
    if (sortBy === 'fill_asc') return a.fill_level - b.fill_level;
    if (sortBy === 'code') return a.bin_code.localeCompare(b.bin_code);
    if (sortBy === 'battery') return b.battery_level - a.battery_level;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </motion.div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Database-Driven Fleet
            </span>
            <span className="text-xs text-slate-400 font-mono">{bins.length} Registered Nodes</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Smart Waste Bins & Realtime Telemetry
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Ultrasonic depth levels, internal temperature, load cells and solar battery states.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBins}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {canManage && (
            <button
              onClick={() => {
                setFormCode('');
                setFormLocation('');
                setFormCategory('Plastic');
                setFormLat('11.0260');
                setFormLng('77.0100');
                setFormCapacity('240');
                setFormError('');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Smart Bin</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, street, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F6F4] text-xs text-[#17231C] pl-8 pr-3 py-2 rounded-xl border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Fill Statuses</option>
            <option value="NORMAL">Normal (0–70%)</option>
            <option value="NEAR_FULL">Near Full (71–89%)</option>
            <option value="CRITICAL">Critical (90–100%)</option>
            <option value="OFFLINE">Offline</option>
          </select>

          {/* Category Filter */}
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
            <option value="E-Waste Drop">E-Waste</option>
            <option value="Mixed Waste">Mixed Waste</option>
          </select>

          {/* Sector Filter */}
          {sectors.length > 0 && (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="all">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="fill_desc">Highest Fill First</option>
              <option value="fill_asc">Lowest Fill First</option>
              <option value="battery">Battery Level</option>
              <option value="code">Bin Code (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Smart Bins */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-slate-400">Loading smart bin records from database...</p>
        </div>
      ) : filteredBins.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7EBE7] space-y-3">
          <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No matching smart bins found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing the sector filter, or registering a new bin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBins.map((bin) => (
            <div
              key={bin.id}
              onClick={() => handleSelectBin(bin)}
              className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 relative group ${
                selectedBin?.id === bin.id
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-[#E7EBE7]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">{bin.bin_code}</span>
                  <h4 className="text-xs font-bold text-slate-800 mt-0.5">{bin.location_name}</h4>
                  <span className="text-[10px] text-slate-400">
                    {bin.waste_category} {bin.sector_name ? `• ${bin.sector_name}` : ''}
                  </span>
                </div>
                <BinStatusBadge status={bin.status} />
              </div>

              {/* Fill Level Meter Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Sensor Fill Level</span>
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
                    style={{ width: `${Math.min(100, Math.max(0, bin.fill_level))}%` }}
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

                {/* Edit & Delete Shortcuts for Admins */}
                {canManage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(bin);
                      }}
                      className="p-1 rounded hover:bg-slate-100 text-slate-600"
                      title="Edit Bin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBinToDelete(bin);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                      title="Delete Bin"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Bin Drawer / Modal */}
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
                  <p className="text-xs text-slate-500">
                    {selectedBin.waste_category} • {selectedBin.municipality_name || 'CCMC'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && (
                    <button
                      onClick={() => openEditModal(selectedBin)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBin(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
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

              {/* Geographic Coordinates & Capacity */}
              <div className="p-3 bg-[#F5F6F4] rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>GPS Coordinates:</span>
                  <span className="font-mono font-medium">{selectedBin.latitude.toFixed(4)}, {selectedBin.longitude.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Volume Capacity:</span>
                  <span className="font-semibold">{selectedBin.max_capacity_liters} Liters ({selectedBin.weight_kg} kg weight)</span>
                </div>
                {selectedBin.last_collection_time && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Last Collection:</span>
                    <span>{new Date(selectedBin.last_collection_time).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Recent Sensor Telemetry Logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Recent Telemetry Recordings</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(binDetails?.sensor_telemetry_history || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No historical telemetry recorded yet.</p>
                  ) : (
                    (binDetails?.sensor_telemetry_history || []).map((reading: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-[#F5F6F4] text-[11px] flex items-center justify-between text-slate-600"
                      >
                        <span className="font-mono">{reading.recorded_at}</span>
                        <span className="font-semibold text-slate-800">{reading.fill_percentage}% Fill</span>
                        <span>{reading.temperature_c}°C</span>
                        <span className="font-mono text-slate-400">{reading.weight_kg} kg</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CLEARLY IDENTIFIED TEST SIMULATOR */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold uppercase tracking-wider">
                    Demo Simulation Mode
                  </span>
                  <span className="text-[10px] text-slate-500">Inject test telemetry reading:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSimulateFill(15)}
                    disabled={isUpdating}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
                  >
                    Simulate 15% (Empty)
                  </button>
                  <button
                    onClick={() => handleSimulateFill(75)}
                    disabled={isUpdating}
                    className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors"
                  >
                    Simulate 75%
                  </button>
                  <button
                    onClick={() => handleSimulateFill(95)}
                    disabled={isUpdating}
                    className="py-2 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold rounded-xl border border-red-200 transition-colors"
                  >
                    Trigger 95% Overflow
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register New Bin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New Smart Bin</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new IoT ultrasonic sensor node to the municipal registry.</p>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium mb-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Bin Identifier Code *</label>
                <input
                  type="text"
                  placeholder="e.g. BIN-MC-011"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Street / Landmark Location *</label>
                <input
                  type="text"
                  placeholder="e.g. PSG Tech Academic Block C, Avinashi Rd"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Waste Stream</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Plastic">Plastic</option>
                    <option value="Organic">Organic</option>
                    <option value="Paper & Cardboard">Paper & Cardboard</option>
                    <option value="Metal & Cans">Metal & Cans</option>
                    <option value="E-Waste Drop">E-Waste</option>
                    <option value="Mixed Waste">Mixed Waste</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Capacity (Liters)</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
                >
                  Save Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bin Modal */}
      {isEditModalOpen && binToEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Edit Smart Bin {binToEdit.bin_code}</h3>
            <p className="text-xs text-slate-500 mb-4">Modify bin location, category or capacity specifications.</p>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium mb-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateBin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Bin Identifier Code *</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Street / Landmark Location *</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Waste Stream</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Plastic">Plastic</option>
                    <option value="Organic">Organic</option>
                    <option value="Paper & Cardboard">Paper & Cardboard</option>
                    <option value="Metal & Cans">Metal & Cans</option>
                    <option value="E-Waste Drop">E-Waste</option>
                    <option value="Mixed Waste">Mixed Waste</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Capacity (Liters)</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full bg-[#F5F6F4] text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
                >
                  Update Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && binToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Smart Bin?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">{binToDelete.bin_code}</span> ({binToDelete.location_name})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBin}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
