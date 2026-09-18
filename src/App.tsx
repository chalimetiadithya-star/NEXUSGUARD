import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ResearchAssistant } from './pages/ResearchAssistant';
import { AuthorizedDocuments } from './pages/AuthorizedDocuments';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDocuments } from './pages/AdminDocuments';
import { AdminUsers } from './pages/AdminUsers';
import { SecurityInspector } from './pages/SecurityInspector';
import { AuditLogs } from './pages/AuditLogs';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false
}) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-500">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
        <span>Verifying trusted identity...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-slate-900">Administrative Access Denied</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account ({user.employee_id} • {user.role}) lacks compliance and security administrative privileges.
          Switch to persona <strong className="text-indigo-600 font-semibold">U901 (Security Admin)</strong> to access this console.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Employee Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/research"
            element={
              <ProtectedRoute>
                <ResearchAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <AuthorizedDocuments />
              </ProtectedRoute>
            }
          />

          {/* Admin & Security Governance Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute adminOnly>
                <AdminDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inspector"
            element={
              <ProtectedRoute adminOnly>
                <SecurityInspector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute adminOnly>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
