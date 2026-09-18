import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DemoUserCard } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoUsers, setDemoUsers] = useState<DemoUserCard[]>([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDemoUsers() {
      try {
        const users = await api.getDemoUsers();
        setDemoUsers(users);
      } catch {
        // Fallback default list if backend not yet reached
      }
    }
    loadDemoUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (empId: string) => {
    setUsername(empId);
    setPassword('password123');
    setError(null);
    setIsSubmitting(true);
    try {
      await login(empId, 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Column: Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Employee Login</h2>
                <p className="text-xs text-slate-500">AccessLens Internal Knowledge Gateway</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID or Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. U102 or arjun.patel@novatech.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Server derives clearance & role directly from backend JWT token. Client credentials cannot escalate privileges.
          </div>
        </div>

        {/* Right Column: 1-Click Demo Accounts Switcher */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Evaluation Mode</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Demo Accounts & Scenarios</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Click any demo persona to test the mandatory hackathon access control scenarios immediately with real server authentication:
            </p>

            <div className="space-y-2.5">
              {demoUsers.length > 0 ? (
                demoUsers.map((u) => (
                  <button
                    key={u.employee_id}
                    onClick={() => handleQuickDemoLogin(u.employee_id)}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{u.employee_id}</span>
                        <span className="text-xs font-semibold text-white">{u.name}</span>
                        <SecurityBadge level={u.clearance} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {u.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-400">Loading demo identities...</div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Default password for demo accounts is: <code className="text-indigo-300 font-mono">password123</code>
          </div>
        </div>

      </div>
    </div>
  );
};
