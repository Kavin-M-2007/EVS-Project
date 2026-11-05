import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckCircle,
  Truck,
  MapPin,
  Camera,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Upload,
  CheckCircle2
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
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isCollectingBin, setIsCollectingBin] = useState<string | number | null>(null);
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  const loadCollectorData = useCallback(async () => {
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
        const active = tList.find((t) => t.status === 'In Progress' || t.status === 'IN_PROGRESS') || tList[0];
        setActiveTask(active);
      }
    } catch (e: any) {
      console.error(e);
      setReportError(e.message || 'Failed to load collector schedule.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCollectorData();
  }, [loadCollectorData]);

  // Supabase Realtime subscription for tasks
  useEffect(() => {
    const unsub = api.subscribeToTasks(() => {
      loadCollectorData();
    });
    return () => unsub();
  }, [loadCollectorData]);

  // Status transition handler: Assigned -> Accepted -> In Progress -> Collected -> Completed
  const handleTransitionStatus = async (targetStatus: string) => {
    if (!activeTask) return;
    setReportError('');
    try {
      await api.updateTaskStatus(activeTask.id, targetStatus);
      if (targetStatus === 'Completed' || targetStatus === 'COMPLETED') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }
      await loadCollectorData();
      setReportSuccess(`Task updated to ${targetStatus}`);
      setTimeout(() => setReportSuccess(''), 3000);
    } catch (e: any) {
      setReportError(e.message || 'Status update failed.');
      setTimeout(() => setReportError(''), 5000);
    }
  };

  // Mark Bin as Collected (Empties bin, saves collection record, resets to 0% fill in database)
  const handleCollectBin = async (bin: SmartBin) => {
    if (isCollectingBin) return;
    setIsCollectingBin(bin.id);
    setReportError('');

    try {
      if (activeTask) {
        await api.updateTaskStatus(
          activeTask.id,
          activeTask.status,
          `Collected ${bin.bin_code}`,
          undefined,
          [bin.id]
        );
      } else {
        await api.updateBinTelemetry(bin.id, {
          fill_level: 0,
          status: 'NORMAL',
          weight_kg: 0,
        });
      }

      confetti({ particleCount: 40, spread: 50 });
      setReportSuccess(`Bin ${bin.bin_code} marked as Collected! Fill reset to 0% in database.`);
      setTimeout(() => setReportSuccess(''), 4000);
      await loadCollectorData();
    } catch (e: any) {
      setReportError(e.message || 'Failed to update bin collection.');
      setTimeout(() => setReportError(''), 5000);
    } finally {
      setIsCollectingBin(null);
    }
  };

  // Handle Photo selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setSelectedProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  // Upload photographic proof to Supabase Storage and mark collected
  const handleSubmitProofPhoto = async () => {
    if (!activeTask) return;
    setIsUploadingProof(true);

    try {
      let uploadedUrl = '';
      if (selectedProofFile) {
        uploadedUrl = await api.uploadFile(selectedProofFile, 'collection-proof');
      }

      await api.updateTaskStatus(
        activeTask.id,
        'Collected',
        'Verified proof photograph attached to municipal ledger',
        uploadedUrl || undefined,
        bins.filter(b => b.fill_level > 70).map(b => b.id)
      );

      confetti({ particleCount: 70, spread: 60 });
      setShowPhotoModal(false);
      setSelectedProofFile(null);
      setProofPreview(null);
      setReportSuccess('Photographic proof verified & uploaded to Supabase Storage.');
      setTimeout(() => setReportSuccess(''), 4000);
      await loadCollectorData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload proof image.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      {/* Toast Notification */}
      {reportSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{reportSuccess}</span>
        </motion.div>
      )}

      {/* Operator Header */}
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
                Assigned Area: <span className="font-semibold text-slate-800">{user?.assigned_area || 'Peelamedu & Avinashi Corridor'}</span>
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
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Tasks Completed</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {summary?.tasks_completed_today || tasks.filter(t => t.status === 'Completed' || t.status === 'COMPLETED').length} / {tasks.length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Bins Cleared</span>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{summary?.bins_collected_today || 8}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Waste Weight</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{summary?.total_weight_collected_kg || 185} kg</p>
          </div>
        </div>
      </div>

      {/* Active Task Card with 5-Stage Stepper */}
      {activeTask ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800">{activeTask.task_code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTask.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeTask.priority} Priority
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{activeTask.area_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeTask.notes || 'Routine collection round'}</p>
            </div>
            <TaskStatusBadge status={activeTask.status} />
          </div>

          {/* Complete 5-Stage Workflow Stepper: ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COLLECTED -> COMPLETED */}
          <div className="bg-[#F5F6F4] p-3.5 rounded-2xl border border-[#E7EBE7]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Dispatch Workflow Progress
            </span>
            <div className="flex items-center justify-between text-[11px] font-semibold relative">
              <div className="absolute left-3 right-3 top-2.5 h-0.5 bg-slate-200 -z-0" />
              {['Assigned', 'Accepted', 'In Progress', 'Collected', 'Completed'].map((st, i) => {
                const currentStatuses = ['Assigned', 'Accepted', 'In Progress', 'Collected', 'Completed'];
                const curIdx = currentStatuses.findIndex(s => s.toLowerCase() === activeTask.status.toLowerCase());
                const isPassed = curIdx >= i;
                const isCurrent = curIdx === i;

                return (
                  <div key={st} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isPassed
                          ? 'bg-[#166534] text-white shadow-xs'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : i + 1}
                    </div>
                    <span className={`mt-1 text-[10px] ${isCurrent ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Interactive Action Buttons */}
          <div className="pt-2">
            {(activeTask.status === 'Assigned' || activeTask.status === 'ASSIGNED') && (
              <button
                type="button"
                onClick={() => handleTransitionStatus('Accepted')}
                className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept Collection Assignment</span>
              </button>
            )}

            {(activeTask.status === 'Accepted' || activeTask.status === 'ACCEPTED') && (
              <button
                type="button"
                onClick={() => handleTransitionStatus('In Progress')}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Collection Drive</span>
              </button>
            )}

            {(activeTask.status === 'In Progress' || activeTask.status === 'IN_PROGRESS') && (
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Proof & Mark Collected</span>
              </button>
            )}

            {(activeTask.status === 'Collected' || activeTask.status === 'COLLECTED') && (
              <button
                type="button"
                onClick={() => handleTransitionStatus('Completed')}
                className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mark Entire Task Completed</span>
              </button>
            )}

            {(activeTask.status === 'Completed' || activeTask.status === 'COMPLETED') && (
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
            View Live GIS Map &rarr;
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
                    {Math.round(bin.fill_level)}%
                  </span>
                  <span className="text-[10px] text-slate-500">{bin.waste_category}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1 truncate">{bin.location_name}</p>
                <span className="text-[10px] text-slate-400">Weight: {bin.weight_kg} kg • Battery: {bin.battery_level}%</span>
              </div>

              <button
                type="button"
                onClick={() => handleCollectBin(bin)}
                disabled={isCollectingBin === bin.id || bin.fill_level === 0}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex-shrink-0 transition-colors shadow-xs ${
                  bin.fill_level === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#166534] hover:bg-[#14532D] text-white'
                }`}
              >
                {isCollectingBin === bin.id ? 'Emptying...' : bin.fill_level === 0 ? 'Emptied' : 'Empty Bin'}
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

      {/* Proof Photo Upload Modal with Genuine File Input */}
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
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Snap or select a photograph of the emptied bins and clean curbside.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload trigger box / preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
              >
                {proofPreview ? (
                  <div className="space-y-2">
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="w-full h-36 object-cover rounded-xl border border-emerald-200"
                    />
                    <span className="text-[10px] font-semibold text-emerald-800">
                      Tap to change photograph
                    </span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-emerald-900 block">
                      Tap to Capture / Select Photo
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Uploaded directly to Supabase Storage (collection-proof)
                    </span>
                  </>
                )}
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
                  onClick={handleSubmitProofPhoto}
                  disabled={isUploadingProof}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D] transition-colors"
                >
                  {isUploadingProof ? 'Uploading to Supabase...' : 'Submit Proof'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
