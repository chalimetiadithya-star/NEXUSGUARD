import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldCheck, Lock, Search, Sparkles, ArrowRight, CheckCircle2, FileText, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Security Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-8 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Zero-Trust Enterprise AI Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Secure Internal Research for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-500">NovaTech Solutions</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Ask natural-language questions across internal enterprise documents. 
              Enforced by a deterministic backend authorization gate: 
              <strong className="text-slate-900 font-semibold block mt-1">"Relevant does not mean authorized."</strong>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <span>{user ? "Enter Research Workspace" : "Access Employee Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-2xs transition-all"
              >
                <span>View Hackathon Demo Personas</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Security Axiom Showcase */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">The Pre-LLM Security Boundary</h2>
            <p className="mt-2 text-sm text-slate-500">
              Why traditional RAG leaks data, and how AccessLens isolates confidential records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Insecure Architecture */}
            <div className="p-6 rounded-2xl border-2 border-rose-200 bg-rose-50/40 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-4">
                FORBIDDEN & INSECURE
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post-Retrieval Filtering / Prompt Redaction</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Retrieving all documents and trusting the LLM with "Please don't reveal restricted information" is prone to prompt injection, jailbreaks, and memory leakage.
              </p>
              <div className="p-3 bg-white rounded-xl border border-rose-200 font-mono text-[11px] text-slate-700 space-y-1">
                <div className="text-rose-600 font-bold">Documents ➔ Retrieve Everything ➔ LLM Prompt</div>
                <div className="text-slate-500">⚠️ Model sees confidential numbers (e.g. 145 crore)</div>
                <div className="text-rose-700 font-semibold">❌ Vulnerable to prompt injection attacks</div>
              </div>
            </div>

            {/* Secure Architecture */}
            <div className="p-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 relative shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
                REQUIRED & ENFORCED IN ACCESSLENS
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Deterministic Pre-LLM Authorization Gate</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                PolicyEngine evaluates clearance, department, and roles BEFORE text content is retrieved. Denied documents are eliminated before the LLM prompt is created.
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-[11px] text-slate-700 space-y-1">
                <div className="text-emerald-700 font-bold">Retrieval ➔ Policy Gate (ALLOW/DENY) ➔ Authorized Only ➔ LLM</div>
                <div className="text-slate-500">🛡️ Denied content is never loaded into context</div>
                <div className="text-emerald-700 font-semibold">✅ Provably safe against any prompt injection</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Deterministic Policy Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clearance hierarchy (Public &lt; Internal &lt; Confidential &lt; Restricted), department segregation, and explicit access lists enforced server-side.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Version & Conflict Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post-authorization version resolver identifies current effective documents by lineage and surfaces genuine conflicts rather than hallucinating answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Audit Trail & Security Inspector</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every research request logs candidate IDs, authorization decisions, and LLM evidence IDs for complete compliance inspection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-400">
        <p>© 2026 NovaTech Solutions. AccessLens Enterprise Research Agent. Built for Hackathon Prototype.</p>
      </footer>
    </div>
  );
};
