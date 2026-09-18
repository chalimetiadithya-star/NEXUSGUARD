import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, ClearanceLevel } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Edit form state
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editClearance, setEditClearance] = useState<ClearanceLevel>('Internal');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (u: UserProfile) => {
    setEditingUserId(u.employee_id);
    setEditRole(u.role);
    setEditDept(u.department);
    setEditClearance(u.clearance);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSave = async (empId: string) => {
    setIsSaving(true);
    try {
      const updated = await api.updateAdminUser(empId, {
        role: editRole,
        department: editDept,
        clearance: editClearance
      });
      setUsers(users.map(u => u.employee_id === empId ? updated : u));
      setEditingUserId(null);
      setMessage(`Updated ${empId} successfully. Access control policies will reflect this immediately.`);
    } catch (err: any) {
      setMessage(`Failed to update user: ${err.message}`);
    } finally {
      setIsSaving(false);
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
            <h1 className="text-2xl font-bold text-slate-900">Users & Access Roles</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Identity Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated employee identities, department assignments, and security clearances.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Clearance Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isEditing = editingUserId === u.employee_id;

                  return (
                    <tr key={u.employee_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {u.employee_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {u.name}
                        <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDept}
                            onChange={(e) => setEditDept(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-xs w-28"
                          />
                        ) : (
                          u.department
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-xs w-28"
                          />
                        ) : (
                          u.role
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <select
                            value={editClearance}
                            onChange={(e) => setEditClearance(e.target.value as ClearanceLevel)}
                            className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                          >
                            <option value="Public">Public</option>
                            <option value="Internal">Internal</option>
                            <option value="Confidential">Confidential</option>
                            <option value="Restricted">Restricted</option>
                          </select>
                        ) : (
                          <SecurityBadge level={u.clearance} size="sm" />
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSave(u.employee_id)}
                              disabled={isSaving}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(u)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Edit Access
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
