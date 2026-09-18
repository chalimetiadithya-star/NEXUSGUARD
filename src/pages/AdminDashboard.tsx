import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  FileText,
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getAdminStats();
        setStats(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Security & Governance Console</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time policy engine metrics, document lifecycle administration, and audit traces.
          </p>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/inspector"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Inspector</span>
          </Link>
          <Link
            to="/admin/audit"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Logs</span>
          </Link>
          <Link
            to="/admin/documents"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Docs</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Users & Roles</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Users</div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_users ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Seeded & active</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Classified Docs</div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_documents ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Indexed with chunks</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Research Queries</div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_queries ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Full audit trails</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Allowed Decisions</div>
          <div className="text-2xl font-black text-emerald-700">{stats?.allowed_decisions ?? 0}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Passed PolicyEngine</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200 bg-rose-50/30 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1">Blocked Decisions</div>
          <div className="text-2xl font-black text-rose-700">{stats?.blocked_decisions ?? 0}</div>
          <div className="text-[11px] text-rose-600 mt-1">Protected from LLM</div>
        </div>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Interactive Security Proof</span>
          </div>
          <h2 className="text-lg font-bold text-white">Security Inspector: Trace Query Pipeline</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Visually inspect any research query to prove that candidate documents were stopped by the deterministic PolicyEngine before prompt synthesis.
          </p>
        </div>
        <Link
          to="/admin/inspector"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-2"
        >
          <span>Open Security Inspector</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Research Activity</h2>
            <p className="text-xs text-slate-400">Click any trace to inspect authorization decisions</p>
          </div>
          <Link to="/admin/audit" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All Logs
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((act) => (
                  <tr key={act.request_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{act.request_id}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {act.user_name} ({act.user_id})
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{act.question}</td>
                    <td className="py-3 px-4">
                      <SecurityBadge status={act.status} type="status" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{act.duration_ms} ms</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/inspector?request_id=${act.request_id}`)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Inspect Trace
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No research queries recorded yet. Launch the AI Research workspace to generate traces.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
