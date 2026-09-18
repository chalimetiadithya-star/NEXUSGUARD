import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Upload,
  Plus,
  Building,
  Calendar,
  GitBranch,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, ClearanceLevel } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';
import { DocumentDrawer } from '../components/DocumentDrawer';

export const AdminDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [docId, setDocId] = useState('');
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [department, setDepartment] = useState('Finance');
  const [classification, setClassification] = useState<ClearanceLevel>('Internal');
  const [allowedDepts, setAllowedDepts] = useState('');
  const [allowedRoles, setAllowedRoles] = useState('');
  const [lineageId, setLineageId] = useState('');
  const [version, setVersion] = useState('1.0');
  const [effectiveDate, setEffectiveDate] = useState('2026-09-01');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (selectedFile) {
        // Upload via FormData
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('document_id', docId.trim().toUpperCase());
        formData.append('title', title.trim());
        formData.append('owner', owner.trim());
        formData.append('department', department.trim());
        formData.append('classification', classification);
        formData.append('allowed_departments', JSON.stringify(allowedDepts.split(',').map(d => d.trim()).filter(Boolean)));
        formData.append('allowed_roles', JSON.stringify(allowedRoles.split(',').map(r => r.trim()).filter(Boolean)));
        formData.append('lineage_id', lineageId.trim());
        formData.append('version', version.trim());
        formData.append('effective_date', effectiveDate.trim());

        await api.uploadAdminDocument(formData);
      } else {
        if (!content.trim()) {
          throw new Error('Please provide document content or select a file to upload.');
        }

        const payload = {
          document_id: docId.trim().toUpperCase(),
          title: title.trim(),
          owner: owner.trim(),
          department: department.trim(),
          classification,
          allowed_departments: allowedDepts.split(',').map(d => d.trim()).filter(Boolean),
          allowed_roles: allowedRoles.split(',').map(r => r.trim()).filter(Boolean),
          lineage_id: lineageId.trim(),
          version: version.trim(),
          effective_date: effectiveDate.trim(),
          status: 'ACTIVE',
          content: content.trim()
        };

        await api.createAdminDocument(payload);
      }

      setIsModalOpen(false);
      resetForm();
      loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to ingest document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDocId('');
    setTitle('');
    setOwner('');
    setDepartment('Finance');
    setClassification('Internal');
    setAllowedDepts('');
    setAllowedRoles('');
    setLineageId('');
    setVersion('1.0');
    setEffectiveDate('2026-09-01');
    setContent('');
    setSelectedFile(null);
    setError(null);
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
            <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Access Control & Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer internal knowledge documents, security classifications, versions, and permitted roles.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Document</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.document_id}
            onClick={() => setSelectedDoc(doc)}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {doc.document_id}
                </span>
                <SecurityBadge level={doc.classification} size="sm" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {doc.title}
              </h3>
              <div className="text-[11px] text-slate-500 mt-1">
                Lineage: <code className="text-slate-700 font-mono font-semibold">{doc.lineage_id}</code>
              </div>
              <div className="mt-3 p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                <div>Allowed Depts: <strong>{doc.allowed_departments.join(', ') || 'All'}</strong></div>
                <div>Allowed Roles: <strong>{doc.allowed_roles.join(', ') || 'All'}</strong></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{doc.owner}</span>
              <div className="flex items-center gap-2 font-mono">
                <span>v{doc.version}</span>
                <span>•</span>
                <span>{doc.effective_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ingestion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Ingest Document & Validate Security Metadata</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DOC-601"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classification *</label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as ClearanceLevel)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Document title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner / Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance Team"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance, Marketing, Executive"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allowed Departments (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Finance, Executive (or leave empty for all)"
                    value={allowedDepts}
                    onChange={(e) => setAllowedDepts(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allowed Roles (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive, Admin (or leave empty for all)"
                    value={allowedRoles}
                    onChange={(e) => setAllowedRoles(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lineage ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4_FORECAST"
                    value={lineageId}
                    onChange={(e) => setLineageId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.0, 2.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effective Date *</label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* File upload or text content */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1">Upload File (TXT, PDF, DOCX)</label>
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or Paste Text Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter full document text to be chunked and indexed..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Ingesting & Chunking...' : 'Save & Make Searchable'}
                </button>
              </div>
            </form>
          </div>
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
