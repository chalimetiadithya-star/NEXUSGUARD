import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ShieldCheck, ExternalLink, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { RequestTrace } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';

export const AuditLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<RequestTrace[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [statusFilter]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminAudit({
        status: statusFilter || undefined,
        user: userFilter.trim() || undefined
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Governance</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Compliance Audit Logs</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic log of all natural-language queries, candidates, policy decisions, and evidence payloads.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Search by Employee ID (e.g. U102, U205) or Name..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="NO_AUTHORIZED_EVIDENCE">NO_AUTHORIZED_EVIDENCE</option>
              <option value="CONFLICT">CONFLICT</option>
              <option value="INSUFFICIENT_EVIDENCE">INSUFFICIENT_EVIDENCE</option>
            </select>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4 text-center">Candidates</th>
                <th className="py-3 px-4 text-center">Allowed</th>
                <th className="py-3 px-4 text-center">Blocked</th>
                <th className="py-3 px-4 text-center">In LLM Context</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const allowedCount = log.authorization_decisions.filter(d => d.allowed).length;
                  const blockedCount = log.authorization_decisions.filter(d => !d.allowed).length;

                  return (
                    <tr key={log.request_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {log.request_id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{log.user_name}</div>
                        <div className="text-[11px] text-slate-400">{log.user_id} • {log.user_department}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        "{log.question}"
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {log.candidate_ids.length}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                          {allowedCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100">
                          {blockedCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-semibold text-indigo-700">
                          {log.llm_evidence_ids.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <SecurityBadge status={log.status} type="status" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/inspector?request_id=${log.request_id}`)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-end gap-1 ml-auto"
                        >
                          <span>Trace</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No matching audit records found.
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
