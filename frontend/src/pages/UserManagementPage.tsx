import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  CheckCircle,
  XCircle,
  KeyRound,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Municipality, UserRole } from '../types';
import { UserRoleBadge } from '../components/common/StatusBadge';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('Admin@123');
  const [actionSuccess, setActionSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // New user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('GARBAGE_COLLECTOR');
  const [municipalityId, setMunicipalityId] = useState<number>(1);
  const [assignedArea, setAssignedArea] = useState('Sector 1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('Admin@123');

  const loadUsersAndMunis = async () => {
    try {
      const [uList, mList] = await Promise.all([
        api.getUsers(
          roleFilter === 'all' ? undefined : roleFilter,
          currentUser?.role === 'SUPER_ADMIN' ? undefined : (currentUser?.municipality_id || 1)
        ),
        api.getMunicipalities(),
      ]);
      setUsers(uList);
      setMunicipalities(mList);
      if (mList.length > 0 && !municipalityId) {
        setMunicipalityId(mList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndMunis();
  }, [roleFilter, currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        full_name: fullName,
        email,
        employee_id: employeeId,
        role,
        municipality_id: currentUser?.role === 'SUPER_ADMIN' ? municipalityId : currentUser?.municipality_id,
        assigned_area: assignedArea,
        phone_number: phoneNumber,
        password
      });
      setShowCreateModal(false);
      setActionSuccess(`User ${fullName} created successfully with role ${role}.`);
      setTimeout(() => setActionSuccess(''), 5000);
      // Reset form
      setFullName('');
      setEmail('');
      setEmployeeId('');
      await loadUsersAndMunis();
    } catch (e: any) {
      alert(e.message || 'Failed to create user.');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateUser(user.id, { status: nextStatus });
      setActionSuccess(`User ${user.full_name} status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await loadUsersAndMunis();
    } catch (e: any) {
      alert(e.message || 'Status update failed.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal || !newPassword) return;
    try {
      await api.resetPassword(showResetModal.id, newPassword);
      setShowResetModal(null);
      setActionSuccess(`Password reset for ${showResetModal.email}.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Password reset failed.');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Identity & Access Management (RBAC)
            </span>
            <span className="text-xs text-slate-400 font-mono">{users.length} Registered Accounts</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Personnel Roster & Municipal Permissions
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Create staff accounts, configure role permissions, and maintain secure credentials.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New User</span>
        </button>
      </div>

      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </motion.div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7EBE7] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, email, Employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F6F4] text-xs text-[#17231C] pl-8 pr-3 py-2 rounded-xl border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#F5F6F4] text-xs font-medium text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">Municipal Admin</option>}
            <option value="GARBAGE_COLLECTOR">Garbage Collector</option>
            <option value="MUNICIPALITY_MONITOR">Municipality Monitor</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EBE7] text-[#747D75] font-semibold">
                <th className="pb-3">Staff Member</th>
                <th className="pb-3">Employee ID</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Assigned Region</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-slate-200">
                        {u.full_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{u.full_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-800">{u.employee_id}</td>
                  <td className="py-3.5">
                    <UserRoleBadge role={u.role} />
                  </td>
                  <td className="py-3.5">
                    <span className="text-slate-800 font-medium">{u.municipality_name || 'Global'}</span>
                    {u.assigned_area && (
                      <span className="text-[10px] text-slate-400 block">{u.assigned_area}</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setShowResetModal(u)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3 h-3 inline mr-1" />
                      Reset
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'text-red-700 bg-red-50 hover:bg-red-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Provision Staff Account</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Desai"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GC-505"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@ecosort.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98XXX XXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role Permission *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                    >
                      {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">Municipal Admin</option>}
                      <option value="GARBAGE_COLLECTOR">Garbage Collector</option>
                      <option value="MUNICIPALITY_MONITOR">Municipality Monitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Municipality *</label>
                    <select
                      value={municipalityId}
                      disabled={currentUser?.role !== 'SUPER_ADMIN'}
                      onChange={(e) => setMunicipalityId(Number(e.target.value))}
                      className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none disabled:opacity-75"
                    >
                      {municipalities.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Operational Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 2 Residential North"
                    value={assignedArea}
                    onChange={(e) => setAssignedArea(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono"
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
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200"
            >
              <h3 className="text-sm font-bold text-slate-900">Reset Account Password</h3>
              <p className="text-xs text-slate-500">
                Set a new credential for <strong>{showResetModal.email}</strong>.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(null)}
                    className="flex-1 py-2 rounded-xl text-slate-600 bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-white bg-[#166534] hover:bg-[#14532D] font-semibold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

