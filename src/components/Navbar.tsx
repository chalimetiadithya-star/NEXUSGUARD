import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, FileText, UserCheck, Settings, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SecurityBadge } from './SecurityBadge';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const demoAccounts = [
    { id: 'U102', label: 'U102 — Arjun Patel (Finance, Internal)', hint: 'Scenario A: Allowed (120 crore)' },
    { id: 'U205', label: 'U205 — Neha Verma (Marketing, Internal)', hint: 'Scenario B: Blocked from Restricted (145 cr)' },
    { id: 'U301', label: 'U301 — Rohan Deshmukh (Finance, Internal)', hint: 'Scenario C: Version resolution (125 cr)' },
    { id: 'U401', label: 'U401 — Vikram Malhotra (Executive, Restricted)', hint: 'Executive: Sees Restricted (145 cr)' },
    { id: 'U901', label: 'U901 — Priya Sharma (Security & Admin)', hint: 'Admin: Inspector & Full Audit Logs' },
  ];

  const handleSwitch = async (empId: string) => {
    setShowDemoMenu(false);
    await switchDemoUser(empId);
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Shield },
    { path: '/research', label: 'AI Research', icon: Sparkles },
    { path: '/documents', label: 'Authorized Docs', icon: FileText },
  ];

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Security & Governance', icon: Settings });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-lg">NovaTech</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    AccessLens
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">Secure Enterprise Research</p>
              </div>
            </Link>

            {/* Nav items */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path || (link.path === '/admin' && location.pathname.startsWith('/admin'));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right actions & User identity */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Quick Persona Switcher for Hackathon Judges */}
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-900 text-xs font-medium transition-all"
                  title="Quick Demo Account Switcher"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Switch Demo Persona:</span>
                  <span className="font-bold text-indigo-700">{user.employee_id}</span>
                  <ChevronDown className="w-3 h-3 text-indigo-500" />
                </button>

                {showDemoMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Identities (Mandatory Scenarios)
                    </div>
                    {demoAccounts.map((acc) => {
                      const isCurrent = user.employee_id === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => handleSwitch(acc.id)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-start justify-between transition-colors ${
                            isCurrent ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{acc.label}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{acc.hint}</div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* User Identity Chip */}
              <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {user.department} • <span className="text-slate-700 font-medium">{user.role}</span>
                  </div>
                </div>
                <SecurityBadge level={user.clearance} size="sm" />
              </div>

              {/* Logout Button */}
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-colors"
              >
                Employee Portal Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
