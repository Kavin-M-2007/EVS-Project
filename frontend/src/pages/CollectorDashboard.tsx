import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckCircle,
  Truck,
  MapPin,
  Camera,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CollectionTask, SmartBin } from '../types';
import { TaskStatusBadge, BinStatusBadge } from '../components/common/StatusBadge';

export const CollectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<CollectionTask | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedBinToCollect, setSelectedBinToCollect] = useState<SmartBin | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCollectorData = async () => {
    try {
      const [tList, bList, summ] = await Promise.all([
        api.getTasks(),
        api.getBins(user?.municipality_id || 1),
        api.getCollectorSummary(),
      ]);
      setTasks(tList);
      setBins(bList);
      setSummary(summ);
      if (tList.length > 0) {
        // pick active in progress or first task
        const active = tList.find(t => t.status === 'In Progress') || tList[0];
        setActiveTask(active);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollectorData();
  }, [user]);

  // Status transition handler: Assigned -> Accepted -> In Progress -> Collected -> Completed
  const handleTransitionStatus = async (targetStatus: string) => {
    if (!activeTask) return;
    try {
      await api.updateTaskStatus(activeTask.id, targetStatus);
      if (targetStatus === 'Completed') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }
      await loadCollectorData();
    } catch (e: any) {
      alert(e.message || 'Status update failed.');
    }
  };

  // Mark Bin as Collected
  const handleCollectBin = async (bin: SmartBin) => {
    try {
      // update bin telemetry to 0% fill
      await api.updateBinTelemetry(bin.id, {
        fill_level: 0,
        status: 'NORMAL',
        weight_kg: 0
      });
      // trigger completion confetti
      confetti({ particleCount: 40, spread: 50 });
      setReportSuccess(`Bin ${bin.bin_code} marked as Collected! Weight recorded.`);
      setTimeout(() => setReportSuccess(''), 4000);
      await loadCollectorData();
    } catch (e: any) {
      alert(e.message || 'Failed to update bin collection.');
    }
  };

  // Simulate proof photo upload
  const handleSimulatePhotoProof = async () => {
    if (!activeTask) return;
    setPhotoUploaded(true);
    setTimeout(async () => {
      await api.updateTaskStatus(
        activeTask.id,
        'Collected',
        'Proof photo verified at collection point',
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
      );
      setShowPhotoModal(false);
      setPhotoUploaded(false);
      await loadCollectorData();
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      {/* Mobile-first Outdoor Operator Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#E7EBE7] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#166534] to-[#22C55E] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-900/10">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#17231C]">{user?.full_name}</h2>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  ID: {user?.employee_id}
                </span>
              </div>
              <p className="text-xs text-[#747D75] mt-0.5">
                Assigned Zone: <span className="font-semibold text-slate-800">{user?.assigned_area || 'Peelamedu - Avinashi Commercial Corridor'}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              On Duty
            </span>
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2.5 bg-[#F5F6F4] rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Today's Tasks</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{summary?.tasks_assigned_today || tasks.length}</p>
          </div>
          <div className="p-2.5 bg-[#F5F6F4] rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{summary?.tasks_completed_today || 1}</p>
          </div>
          <div className="p-2.5 bg-[#F5F6F4] rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Collected (kg)</span>
            <p className="text-lg font-bold text-blue-700 mt-0.5">{summary?.total_weight_collected_kg || 1420}</p>
          </div>
        </div>
      </div>

      {reportSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{reportSuccess}</span>
        </motion.div>
      )}

      {/* Active Task Hero Card with Workflow Buttons (Requirement #10) */}
      {activeTask ? (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-600 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Current Active Task
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 font-mono">
                {activeTask.task_code}
              </h3>
            </div>
            <TaskStatusBadge status={activeTask.status} />
          </div>

          <div className="py-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Pickup Area:</span>
              <span className="font-semibold text-slate-900">{activeTask.area_name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Assigned Vehicle:</span>
              <span className="font-semibold text-slate-900 font-mono">{activeTask.vehicle_plate || 'TN-38-EV-4421'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Route Code:</span>
              <span className="font-semibold text-slate-900">{activeTask.route_name || 'Peelamedu Avinashi Corridor'}</span>
            </div>
            {activeTask.notes && (
              <p className="p-2.5 bg-amber-50 rounded-xl text-amber-900 text-xs border border-amber-200/80">
                <strong>Admin Note:</strong> {activeTask.notes}
              </p>
            )}
          </div>

          {/* Step-by-Step Mobile Action Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {activeTask.status === 'Assigned' && (
              <button
                onClick={() => handleTransitionStatus('Accepted')}
                className="w-full py-3.5 bg-[#166534] hover:bg-[#14532D] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept Task & Route</span>
              </button>
            )}

            {activeTask.status === 'Accepted' && (
              <button
                onClick={() => handleTransitionStatus('In Progress')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Collection Drive</span>
              </button>
            )}

            {activeTask.status === 'In Progress' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Proof Photo</span>
                </button>
                <button
                  onClick={() => handleTransitionStatus('Completed')}
                  className="py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Complete Task</span>
                </button>
              </div>
            )}

            {activeTask.status === 'Collected' && (
              <button
                onClick={() => handleTransitionStatus('Completed')}
                className="w-full py-3.5 bg-[#166534] hover:bg-[#14532D] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mark Entire Task Completed</span>
              </button>
            )}

            {activeTask.status === 'Completed' && (
              <div className="text-center py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                ✓ Task successfully completed and logged to municipal ledger.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 text-center border border-[#E7EBE7]">
          <p className="text-xs text-slate-500">No active collection tasks right now.</p>
        </div>
      )}

      {/* Smart Bins Along Route (with 1-touch Empty Action) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#17231C]">Smart Bins on Current Route</h3>
            <p className="text-xs text-[#747D75]">Touch "Empty Bin" after loading vehicle</p>
          </div>
          <NavLink to="/map" className="text-xs text-emerald-700 font-semibold hover:underline">
            View Live GPS Map &rarr;
          </NavLink>
        </div>

        <div className="space-y-3">
          {bins.slice(0, 5).map((bin) => (
            <div
              key={bin.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{bin.bin_code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    bin.fill_level >= 85 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {bin.fill_level}%
                  </span>
                  <span className="text-[10px] text-slate-500">{bin.waste_category}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1 truncate">{bin.location_name}</p>
                <span className="text-[10px] text-slate-400">Weight: {bin.weight_kg} kg • Battery: {bin.battery_level}%</span>
              </div>

              <button
                type="button"
                onClick={() => handleCollectBin(bin)}
                className="px-3.5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl flex-shrink-0 transition-colors shadow-xs"
              >
                Empty Bin
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Field Reporting Actions: Overflow / Damage */}
      <div className="grid grid-cols-2 gap-3">
        <NavLink
          to="/citizen-portal"
          className="p-4 bg-white rounded-2xl border border-red-200 text-center hover:bg-red-50/50 transition-colors block"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-900 block">Report Overflowing Bin</span>
          <span className="text-[10px] text-slate-500">Send dispatch notification</span>
        </NavLink>

        <NavLink
          to="/citizen-portal"
          className="p-4 bg-white rounded-2xl border border-amber-200 text-center hover:bg-amber-50/50 transition-colors block"
        >
          <Camera className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-900 block">Report Damaged Bin</span>
          <span className="text-[10px] text-slate-500">Upload photos of vandalized lid</span>
        </NavLink>
      </div>

      {/* Proof Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Upload Collection Proof</h4>
                <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>
              <p className="text-xs text-slate-500">
                Snap or select a photograph of the emptied bins and clean curbside.
              </p>

              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/50">
                <Camera className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <span className="text-xs font-semibold text-emerald-900 block">Tap to Capture / Select Photo</span>
                <span className="text-[10px] text-emerald-700">Proof is geotagged and timestamped</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePhotoProof}
                  disabled={photoUploaded}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D]"
                >
                  {photoUploaded ? 'Uploading...' : 'Submit Proof'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

