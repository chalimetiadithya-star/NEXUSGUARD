import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';
import { ClearanceLevel } from '../types';

interface SecurityBadgeProps {
  level?: ClearanceLevel | string;
  type?: 'clearance' | 'decision' | 'status';
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  level,
  type = 'clearance',
  status,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  }[size];

  if (type === 'decision') {
    const isAllowed = status === 'ALLOW' || status === 'ALLOWED' || status === 'true';
    if (isAllowed) {
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          AUTHORIZED
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 ${sizeClasses}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        BLOCKED
      </span>
    );
  }

  if (type === 'status') {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ${sizeClasses}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SUCCESS
          </span>
        );
      case 'NO_AUTHORIZED_EVIDENCE':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 ${sizeClasses}`}>
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            NO AUTHORIZED EVIDENCE
          </span>
        );
      case 'CONFLICT':
        return (
          <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            SOURCE CONFLICT
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 ${sizeClasses}`}>
            {status || 'UNKNOWN'}
          </span>
        );
    }
  }

  // Clearance badge
  const normLevel = (level || 'Public').toString().toLowerCase();
  switch (normLevel) {
    case 'restricted':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 ${sizeClasses}`}>
          <Lock className="w-3.5 h-3.5 text-rose-600" />
          RESTRICTED
        </span>
      );
    case 'confidential':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          CONFIDENTIAL
        </span>
      );
    case 'internal':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ${sizeClasses}`}>
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          INTERNAL
        </span>
      );
    case 'public':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 ${sizeClasses}`}>
          <Eye className="w-3.5 h-3.5 text-slate-600" />
          PUBLIC
        </span>
      );
  }
};
