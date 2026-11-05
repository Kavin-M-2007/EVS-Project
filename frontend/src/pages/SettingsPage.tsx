import React, { useState } from 'react';
import { CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'alerts'>('profile');
  const [criticalThreshold, setCriticalThreshold] = useState('85');
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveError('');
    try {
      if (newPassword) {
        await api.resetPassword(user.id, newPassword);
      }
      setSaveSuccess('Profile settings saved successfully.');
      setNewPassword('');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (e: any) {
      setSaveError(e.message || 'Save failed.');
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              System Settings
            </span>
            <span className="text-xs text-slate-400 font-mono">Platform Config</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            Account Preferences & Municipal Configuration
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Configure telemetry alert thresholds, session security and operator details.
          </p>
        </div>

        <div className="flex items-center p-1 bg-[#F5F6F4] rounded-2xl border border-[#E7EBE7] text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            IoT Thresholds
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-7 border border-[#E7EBE7] shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-green-500 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.full_name}</h3>
              <p className="text-xs text-slate-500">{user?.email} • ID: {user?.employee_id}</p>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1 inline-block">
                Role: {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.full_name || ''}
                  className="w-full bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  disabled
                  value={user?.employee_id || ''}
                  className="w-full bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Municipality</label>
                <input
                  type="text"
                  disabled
                  value={user?.municipality_name || 'Global Organization'}
                  className="w-full bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Security Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl p-7 border border-[#E7EBE7] shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">IoT Telemetry & Alert Trigger Settings</h3>
            <p className="text-slate-500">Configure thresholds for automated alert notifications</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Critical Fill Alert Trigger Threshold (%):
              </label>
              <input
                type="number"
                min="50"
                max="99"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
                className="w-48 bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Bins exceeding this fill capacity trigger instant dispatch notifications.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Auto-Dispatch Tour Suggestion</span>
                <span className="text-slate-400 text-[11px]">
                  Automatically compute TSP tour when more than 3 bins reach critical fill level
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

