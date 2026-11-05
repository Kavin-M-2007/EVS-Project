import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DemoCredentialsBar } from '../components/common/DemoCredentialsBar';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('superadmin@ecosort.ai');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Please enter both email/Employee ID and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(identifier, password);
      // Role-based redirection (Requirement #7 & #12)
      switch (user.role) {
        case 'SUPER_ADMIN':
          navigate('/dashboard/super-admin');
          break;
        case 'ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'GARBAGE_COLLECTOR':
          navigate('/dashboard/collector');
          break;
        case 'MUNICIPALITY_MONITOR':
          navigate('/dashboard/monitor');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (email: string) => {
    setIdentifier(email);
    setPassword('Admin@123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#F5F6F4] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Floating Eco Particle Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 18, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-16 text-emerald-200/50"
        >
          <Leaf className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -20, 0], rotate: [0, -25, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-16 right-20 text-emerald-200/40"
        >
          <Leaf className="w-24 h-24" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl -z-10"
        />
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#166534] text-white shadow-lg shadow-emerald-900/20 mb-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
              <path d="M10 10v4" />
              <path d="M14 10v4" />
              <path d="M12 2v3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17231C]">
            EcoSort <span className="text-[#22C55E]">AI</span>
          </h1>
          <p className="text-xs text-[#747D75]">
            Intelligent Waste Management & Environmental IoT Platform
          </p>
        </div>

        {/* Demo Credentials Bar (for instant testing of all 4 roles) */}
        <DemoCredentialsBar onSelectAccount={handleSelectAccount} />

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 border border-[#E7EBE7] shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium"
              >
                {errorMsg}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">
                Email Address or Employee ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. superadmin@ecosort.ai or SA-001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#F5F6F4] text-xs text-[#17231C] pl-10 pr-3 py-2.5 rounded-xl border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#17231C]">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('For security, passwords can be reset by authorized Admins in the User Management module.');
                  }}
                  className="text-[11px] text-[#166534] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F6F4] text-xs text-[#17231C] pl-10 pr-10 py-2.5 rounded-xl border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#747D75]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                RBAC Enforced
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#166534] hover:bg-[#14532D] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enterprise Multi-Tenant</span>
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>EcoSort AI v2.0</span>
            </div>
          </div>
        </div>

        {/* Public Citizen Portal quick link */}
        <div className="text-center">
          <p className="text-xs text-[#747D75]">
            Looking to report street litter or check complaints?{' '}
            <a
              href="/citizen-portal"
              className="text-[#166534] font-semibold hover:underline"
            >
              Open Citizen Portal &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

