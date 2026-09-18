import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle2,
  Building,
  User,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';
import { DocumentDrawer } from '../components/DocumentDrawer';

export const EmployeeDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthorizedDocs() {
      try {
        const docs = await api.getDocuments();
        setRecentDocs(docs.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuthorizedDocs();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Employee Identity Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-600/20">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                {user.employee_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.department} Department • <strong className="text-slate-700">{user.role}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Security Clearance
            </div>
            <SecurityBadge level={user.clearance} size="lg" />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ask Research Agent */}
        <Link
          to="/research"
          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-900/10 hover:shadow-indigo-900/20 transition-all hover:scale-[1.01] flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/30 flex items-center justify-center mb-4 text-indigo-300 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">AI Research Assistant</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask natural-language questions. The deterministic authorization gate screens candidates before model context construction.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-300 group-hover:text-white transition-colors">
            <span>Launch Research Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* View Authorized Documents */}
        <Link
          to="/documents"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Authorized Documents</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse internal company records that your account is cryptographically and deterministically permitted to view.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            <span>Browse {recentDocs.length} Permitted Documents</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Security & Governance */}
        {isAdmin ? (
          <Link
            to="/admin"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mb-4 text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Security Inspector & Audits</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect query traces, verify allow/deny decision logs, and manage document classifications and user roles.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
              <span>Open Security Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 mb-1">Security & Governance</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Administration and security inspection endpoints require Admin/Compliance role (switch to persona U901 to inspect).
              </p>
            </div>
            <div className="mt-6 text-[11px] text-slate-400 italic">
              Restricted to authorized compliance officers.
            </div>
          </div>
        )}
      </div>

      {/* Permitted Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Permitted Documents</h2>
          <Link to="/documents" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading permitted records...</div>
        ) : recentDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDocs.map((doc) => (
              <div
                key={doc.document_id}
                onClick={() => setSelectedDoc(doc)}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {doc.document_id}
                    </span>
                    <SecurityBadge level={doc.classification} size="sm" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{doc.title}</h3>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>v{doc.version}</span>
                  <span>{doc.effective_date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No authorized documents found for your clearance level.
          </div>
        )}
      </div>

      {/* Document Drawer */}
      <DocumentDrawer
        document={selectedDoc}
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
