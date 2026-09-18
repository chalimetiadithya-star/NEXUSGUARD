import React from 'react';
import { FileText, ExternalLink, Calendar, GitBranch } from 'lucide-react';
import { Citation } from '../types';
import { SecurityBadge } from './SecurityBadge';

interface CitationCardProps {
  citation: Citation;
  onClick?: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(citation)}
      className="group flex flex-col p-3 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {citation.document_id}
          </span>
          <SecurityBadge level={citation.classification} size="sm" />
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
      </div>

      <div className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {citation.title}
      </div>

      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3 text-slate-400" />
          v{citation.version}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          {citation.effective_date}
        </span>
      </div>

      {citation.excerpt && (
        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2 italic font-serif">
          "{citation.excerpt}"
        </div>
      )}
    </div>
  );
};
