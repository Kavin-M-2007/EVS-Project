import React, { useEffect, useState } from 'react';
import {
  Truck,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Camera,
  Search,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CollectionTask, User } from '../types';
import { TaskStatusBadge, PriorityBadge } from '../components/common/StatusBadge';

export const CollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [collectors, setCollectors] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);

  // Form states for new task
  const [newArea, setNewArea] = useState('Sector 1 Commercial');
  const [newCollectorId, setNewCollectorId] = useState<number | ''>('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const [tList, cList] = await Promise.all([
        api.getTasks(
          statusFilter === 'all' ? undefined : statusFilter,
          priorityFilter === 'all' ? undefined : priorityFilter
        ),
        api.getUsers('GARBAGE_COLLECTOR', user?.municipality_id || 1),
      ]);
      setTasks(tList);
      setCollectors(cList);
      if (cList.length > 0 && !newCollectorId) {
        setNewCollectorId(cList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectorId) {
      alert('Please select a collector.');
      return;
    }

    try {
      await api.createTask({
        municipality_id: user?.municipality_id || 1,
        collector_id: Number(newCollectorId),
        area_name: newArea,
        priority: newPriority,
        notes: newNotes
      });
      setShowCreateModal(false);
      setNewNotes('');
      await fetchTasks();
    } catch (e: any) {
      alert(e.message || 'Task creation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Fleet Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">{tasks.length} Operational Orders</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Collection Task Dispatch & Workflows
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Real-time status transitions: Assigned &rarr; Accepted &rarr; In Progress &rarr; Collected &rarr; Completed.
          </p>
        </div>

        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Collection Order</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span>Filter Tasks:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Collected">Collected</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EBE7] text-[#747D75] font-semibold">
                <th className="pb-3">Task ID</th>
                <th className="pb-3">Area / Sector</th>
                <th className="pb-3">Assigned Collector</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Workflow State</th>
                <th className="pb-3">Proof Photo</th>
                <th className="pb-3 text-right">Assigned Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">{task.task_code}</td>
                  <td className="py-3.5">{task.area_name}</td>
                  <td className="py-3.5 font-semibold text-slate-900">{task.collector_name}</td>
                  <td className="py-3.5 font-mono text-slate-500">{task.vehicle_plate || 'EV-4421'}</td>
                  <td className="py-3.5">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="py-3.5">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="py-3.5">
                    {task.proof_image_url ? (
                      <button
                        onClick={() => setSelectedProofImg(task.proof_image_url || null)}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px]">No Photo</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(task.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Dispatch Collection Task</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Sector / Area:</label>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Collector:</label>
                  <select
                    value={newCollectorId}
                    onChange={(e) => setNewCollectorId(Number(e.target.value))}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    {collectors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.employee_id}) • {c.assigned_area || 'Zone 1'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="HIGH">High (Immediate Overflow Surge)</option>
                    <option value="MEDIUM">Medium (Scheduled Standard Tour)</option>
                    <option value="LOW">Low (Routine Clearance)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatch Instructions / Notes:</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Focus on plastic recyclables at Market Square"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#166534] hover:bg-[#14532D]"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proof Photo Modal */}
      <AnimatePresence>
        {selectedProofImg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Proof of Collection Photo</span>
                <button onClick={() => setSelectedProofImg(null)} className="text-slate-400">✕</button>
              </div>
              <img
                src={selectedProofImg}
                alt="Proof"
                className="w-full h-64 object-cover rounded-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

