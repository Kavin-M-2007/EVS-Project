import React, { useState } from 'react';
import {
  FileText,
  MapPin,
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export const CitizenPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // Submit Complaint Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [complaintType, setComplaintType] = useState('Overflowing Bin');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);

  // Track Complaint State
  const [trackTicketNumber, setTrackTicketNumber] = useState('ECO-TKT-8841');
  const [trackedResult, setTrackedResult] = useState<any>(null);
  const [trackError, setTrackError] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !locationName || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedPhotoUrl: string | undefined = undefined;
      if (photoFile) {
        try {
          uploadedPhotoUrl = await api.uploadFile(photoFile, 'complaint-photos');
        } catch (uploadErr) {
          console.warn('Complaint photo upload notice, proceeding:', uploadErr);
        }
      }

      const res = await api.submitComplaint({
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        citizen_email: citizenEmail,
        municipality_id: 'a0000000-0000-0000-0000-000000000001', // Coimbatore default
        complaint_type: complaintType,
        locationName: locationName,
        location_name: locationName,
        description: description,
        photo_url: uploadedPhotoUrl,
      });
      setSubmittedTicket(res);
      // Reset form
      setCitizenName('');
      setCitizenPhone('');
      setLocationName('');
      setDescription('');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: any) {
      alert(e.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTicketNumber) return;

    setIsTracking(true);
    setTrackError('');
    setTrackedResult(null);

    try {
      const res = await api.trackComplaint(trackTicketNumber);
      setTrackedResult(res);
    } catch (e: any) {
      setTrackError(e.message || 'Ticket not found.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#166534] flex items-center justify-center mx-auto shadow-xs">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#17231C]">
          Citizen Environmental Support & Litter Reporting
        </h2>
        <p className="text-xs text-[#747D75] max-w-md mx-auto">
          Help maintain clean neighborhoods. Report street litter, damaged bin sensors or missed municipal collections.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex items-center p-1 bg-[#F5F6F4] rounded-2xl border border-[#E7EBE7] mt-3">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'submit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Submit Grievance
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'track' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Track Ticket Status
          </button>
        </div>
      </div>

      {/* Tab 1: Submit Grievance Form */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-3xl p-7 border border-[#E7EBE7] shadow-xs">
          {submittedTicket ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-950">
                Grievance Lodged Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Your report has been dispatched to the municipal rapid-response collection team.
              </p>
              <div className="p-3 bg-white rounded-xl inline-block border border-emerald-200 font-mono text-xs font-bold text-emerald-900">
                Ticket Reference: {submittedTicket.ticket_number}
              </div>
              <div>
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="px-4 py-2 bg-[#166534] text-white text-xs font-semibold rounded-xl"
                >
                  Submit Another Report
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Grievance Nature *</label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Overflowing Bin">Overflowing Street Bin</option>
                    <option value="Damaged Bin Lid">Damaged or Vandalized Bin</option>
                    <option value="Missed Collection">Missed Household Collection</option>
                    <option value="Illegal Dumping">Illegal Curbside Dumping</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Location / Street Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Hope College Bus Stop, Avinashi Road, Peelamedu"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide brief details regarding the litter or bin condition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F5F6F4] p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 text-center relative hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload photograph proof"
                />
                {photoPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-300 shadow-xs"
                    />
                    <div className="text-left">
                      <span className="text-xs font-semibold text-emerald-800 block">Photo Selected</span>
                      <span className="text-[10px] text-slate-500">{photoFile?.name}</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Click to replace photo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-slate-600 font-medium block">Attach Photograph Proof (Optional)</span>
                    <span className="text-[10px] text-slate-400">Click to select photo • Supports JPG, PNG, WEBP</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isSubmitting ? 'Transmitting Report...' : 'Lodge Grievance with Municipality'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Track Ticket Status */}
      {activeTab === 'track' && (
        <div className="bg-white rounded-3xl p-7 border border-[#E7EBE7] shadow-xs space-y-4">
          <form onSubmit={handleTrack} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Enter Ticket ID (e.g. ECO-TKT-8841)"
              value={trackTicketNumber}
              onChange={(e) => setTrackTicketNumber(e.target.value)}
              className="flex-1 bg-[#F5F6F4] text-xs font-mono font-bold p-3 rounded-2xl border border-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isTracking}
              className="px-5 py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl transition-colors"
            >
              Track Status
            </button>
          </form>

          {trackError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
              {trackError}
            </div>
          )}

          {trackedResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {trackedResult.ticket_number}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  trackedResult.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {trackedResult.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Issue Type:</span>
                  <span className="font-semibold text-slate-800">{trackedResult.complaint_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Location:</span>
                  <span className="font-semibold text-slate-800">{trackedResult.location_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reported At:</span>
                  <span className="font-medium text-slate-700">{trackedResult.created_at}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Resolved At:</span>
                  <span className="font-medium text-slate-700">{trackedResult.resolved_at || 'In Resolution Queue'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

