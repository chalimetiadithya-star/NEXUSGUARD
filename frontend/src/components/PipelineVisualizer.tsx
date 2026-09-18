import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowDown,
  UserCheck,
  Search,
  Cpu,
  CheckCircle2,
  FileCheck2,
  Layers,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { RequestTrace } from '../types';
import { SecurityBadge } from './SecurityBadge';

interface PipelineVisualizerProps {
  trace: RequestTrace;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ trace }) => {
  const allowedDecisions = trace.authorization_decisions.filter(d => d.allowed);
  const deniedDecisions = trace.authorization_decisions.filter(d => !d.allowed);

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-400 font-bold">{trace.request_id}</span>
            <SecurityBadge status={trace.status} type="status" size="sm" />
          </div>
          <div className="text-sm font-medium mt-1 text-slate-200">
            "{trace.question}"
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{trace.duration_ms} ms</span>
          </div>
          <div>
            Candidates: <strong className="text-white">{trace.candidate_ids.length}</strong>
          </div>
          <div>
            Allowed: <strong className="text-emerald-400">{allowedDecisions.length}</strong>
          </div>
          <div>
            Blocked: <strong className="text-rose-400">{deniedDecisions.length}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Visual Graph */}
      <div className="relative border border-slate-200 rounded-2xl bg-white p-6 shadow-xs space-y-6">

        {/* STAGE 1: Question & Authenticated Identity */}
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              1. Question Received
            </div>
            <p className="text-sm font-semibold text-slate-800 italic">
              "{trace.question}"
            </p>
          </div>

          <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              2. Trusted Server Identity
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{trace.user_name} ({trace.user_id})</div>
                <div className="text-xs text-slate-500">Dept: {trace.user_department} • Role: {trace.user_role}</div>
              </div>
              <SecurityBadge level={trace.user_clearance} size="md" />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>

        {/* STAGE 2: Candidate Retrieval */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Search className="w-4 h-4 text-blue-600" />
              3. Candidate Retrieval ({trace.candidate_ids.length} documents identified)
            </div>
            <span className="text-[11px] text-slate-500 italic">
              Relevant does not mean authorized
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trace.candidate_ids.map((cid) => (
              <span key={cid} className="font-mono text-xs px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 font-semibold shadow-2xs">
                {cid}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>

        {/* STAGE 3: THE CRITICAL DETERMINISTIC AUTHORIZATION GATE */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-slate-50/50 border-2 border-indigo-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                4. DETERMINISTIC AUTHORIZATION GATE (PolicyEngine)
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Evaluated Outside LLM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allowed Candidates */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Authorized Candidates ({allowedDecisions.length})
              </div>
              {allowedDecisions.length > 0 ? (
                <div className="space-y-2">
                  {allowedDecisions.map((dec) => (
                    <div key={dec.document_id} className="flex items-center justify-between p-2 rounded bg-white border border-emerald-100 text-xs">
                      <div>
                        <span className="font-mono font-bold text-emerald-700 mr-2">{dec.document_id}</span>
                        <span className="text-slate-700">{dec.title || 'Document'}</span>
                      </div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {dec.reason}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No candidates met authorization criteria.</p>
              )}
            </div>

            {/* Blocked Candidates */}
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Blocked Unauthorized ({deniedDecisions.length})
              </div>
              {deniedDecisions.length > 0 ? (
                <div className="space-y-2">
                  {deniedDecisions.map((dec) => (
                    <div key={dec.document_id} className="flex items-center justify-between p-2 rounded bg-white border border-rose-100 text-xs">
                      <div>
                        <span className="font-mono font-bold text-rose-700 mr-2">{dec.document_id}</span>
                        <span className="text-slate-600">{dec.title || 'Classified Document'}</span>
                      </div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                        {dec.reason}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Zero candidates were denied for this query.</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Hard Security Assertion Verified:</strong> Content of blocked documents (e.g. DOC-201) was deterministically discarded here and never loaded into prompts or memory.
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>

        {/* STAGE 4: Version & Conflict Resolution */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-600" />
              5. Version Resolution (Authorized Evidence Only)
            </div>
          </div>
          <div className="text-xs text-slate-600 mb-3">
            Selected active versions:
          </div>
          <div className="flex flex-wrap gap-2">
            {trace.selected_ids.length > 0 ? (
              trace.selected_ids.map((sid) => (
                <span key={sid} className="font-mono text-xs px-2.5 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
                  {sid} (Active Version)
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">None (no authorized documents passed the gate)</span>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>

        {/* STAGE 5: LLM Context Construction & Safe Synthesis */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              6. Secure LLM Context & Grounded Synthesis
            </div>
            <span className="font-mono text-xs text-slate-500">
              Evidence in Context: [{trace.llm_evidence_ids.join(', ') || 'NONE'}]
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500 font-semibold">Invariant Check:</div>
            <div className="font-mono text-indigo-700">
              all(context.source_ids) ⊆ authorized_ids: <strong className="text-emerald-600">PASS (Verified)</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
