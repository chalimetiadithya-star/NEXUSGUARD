import React from 'react';
import { X, ShieldCheck, FileText, Calendar, Building, GitBranch, User } from 'lucide-react';
import { Citation, DocumentItem } from '../types';
import { SecurityBadge } from './SecurityBadge';

interface DocumentDrawerProps {
  document: Citation | DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const content = 'content' in document ? (document as DocumentItem).content : (document as Citation).excerpt;
  const owner = 'owner' in document ? (document as DocumentItem).owner : undefined;
  const status = 'status' in document ? (document as DocumentItem).status : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                {document.document_id}
              </span>
              <SecurityBadge level={document.classification} size="md" />
              {status && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  {status}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{document.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Gate Verification Callout */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Deterministic Authorization Verified:</strong> Your authenticated clearance permits viewing this record.
          </span>
        </div>

        {/* Metadata Grid */}
        <div className="p-5 border-b border-slate-100 grid grid-cols-2 gap-4 bg-white text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Department: <strong className="text-slate-900">{document.department}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Effective: <strong className="text-slate-900">{document.effective_date}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <GitBranch className="w-4 h-4 text-slate-400" />
            <span>Version: <strong className="text-slate-900">{document.version}</strong></span>
          </div>
          {owner && (
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>Owner: <strong className="text-slate-900">{owner}</strong></span>
            </div>
          )}
        </div>

        {/* Permitted Document Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Permitted Document Content
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-800 font-sans whitespace-pre-wrap">
            {content || 'No readable excerpt available for this document.'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
