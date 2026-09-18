import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { RequestTrace } from '../types';
import { PipelineVisualizer } from '../components/PipelineVisualizer';

export const SecurityInspector: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryRequestId = searchParams.get('request_id') || '';
  const [requestIdInput, setRequestIdInput] = useState(queryRequestId);
  const [trace, setTrace] = useState<RequestTrace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTraces, setRecentTraces] = useState<RequestTrace[]>([]);

  useEffect(() => {
    loadRecentTraces();
  }, []);

  useEffect(() => {
    if (queryRequestId) {
      setRequestIdInput(queryRequestId);
      fetchTrace(queryRequestId);
    }
  }, [queryRequestId]);

  const loadRecentTraces = async () => {
    try {
      const logs = await api.getAdminAudit();
      setRecentTraces(logs.slice(0, 8));
      if (!queryRequestId && logs.length > 0) {
        setSearchParams({ request_id: logs[0].request_id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrace = async (reqId: string) => {
    if (!reqId.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRequestTrace(reqId.trim());
      setTrace(data);
    } catch (err: any) {
      setError(err.message || 'Trace not found for this request ID.');
      setTrace(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestIdInput.trim()) {
      setSearchParams({ request_id: requestIdInput.trim() });
    }
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
            <h1 className="text-2xl font-bold text-slate-900">Security Inspector</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Deterministic Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit proof: Restricted candidate evidence was stopped by PolicyEngine before entering LLM context.
          </p>
        </div>

        {/* Quick Trace Search Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={requestIdInput}
              onChange={(e) => setRequestIdInput(e.target.value)}
              placeholder="Enter REQ-ID..."
              className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Inspect
          </button>
        </form>
      </div>

      {/* Quick Select Buttons from Recent Logs */}
      {recentTraces.length > 0 && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Recent Queries:
          </span>
          {recentTraces.map((r) => (
            <button
              key={r.request_id}
              onClick={() => setSearchParams({ request_id: r.request_id })}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] shrink-0 transition-all ${
                queryRequestId === r.request_id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {r.request_id} ({r.user_id})
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong>Lookup Failed:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-16 text-center text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Retrieving full cryptographic trace from audit log...</span>
        </div>
      )}

      {/* Trace Visualization Graph */}
      {trace && !isLoading && (
        <PipelineVisualizer trace={trace} />
      )}
    </div>
  );
};
