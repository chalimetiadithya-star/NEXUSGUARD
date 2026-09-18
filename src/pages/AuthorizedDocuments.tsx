import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Calendar, Building, GitBranch, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';
import { DocumentDrawer } from '../components/DocumentDrawer';
import { useAuth } from '../contexts/AuthContext';

export const AuthorizedDocuments: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [classification, setClassification] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [department, classification]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await api.getDocuments({
        search: search.trim() || undefined,
        department: department || undefined,
        classification: classification || undefined
      });
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Authorized Documents</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Server-Filtered
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Records deterministically authorized for your account ({user?.employee_id} • {user?.clearance} clearance).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Restricted files are excluded by backend policy</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document title, ID, or keywords..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Executive">Executive</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Classifications</option>
              <option value="Public">Public</option>
              <option value="Internal">Internal</option>
              <option value="Confidential">Confidential</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>
        </form>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading authorized documents...</div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              onClick={() => setSelectedDoc(doc)}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {doc.document_id}
                  </span>
                  <SecurityBadge level={doc.classification} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {doc.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.content || 'Document metadata verified.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.department}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>v{doc.version}</span>
                  <span>{doc.effective_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No authorized documents match your criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your filters or search terms.</p>
        </div>
      )}

      {/* Drawer */}
      <DocumentDrawer
        document={selectedDoc}
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
