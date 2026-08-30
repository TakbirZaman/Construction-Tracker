import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { WSProvider } from './context/WSContext.jsx';
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext.jsx';
import Layout from './components/layout/Layout.jsx';
import SplashScreen from './components/ui/SplashScreen.jsx';
import Login from './features/auth/Login.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Projects from './features/projects/Projects.jsx';
import ProjectDetail from './features/projects/ProjectDetail.jsx';
import MyTasks from './features/tasks/MyTasks.jsx';
import MaterialsOverview from './features/materials/MaterialsOverview.jsx';
import BudgetOverview from './features/budget/BudgetOverview.jsx';
import AdminPanel from './features/admin/AdminPanel.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-3 border-brand-100 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Navigate to="/dashboard" replace /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
      <Route path="/my-tasks" element={<ProtectedRoute roles={['worker','manager','admin']}><Layout><MyTasks /></Layout></ProtectedRoute>} />
      <Route path="/materials" element={<ProtectedRoute roles={['admin','manager']}><Layout><MaterialsOverview /></Layout></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute roles={['admin','manager']}><Layout><BudgetOverview /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout><AdminPanel /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function AppShell() {
  const { dark } = useDarkMode();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: dark ? '#1e293b' : '#ffffff',
              color: dark ? '#e2e8f0' : '#1e293b',
              border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              fontSize: '14px',
              padding: '12px 16px',
            },
          }}
        />
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
        {splashDone && (
          <BrowserRouter>
            <AuthProvider>
              <WSProvider>
                <AppRoutes />
              </WSProvider>
            </AuthProvider>
          </BrowserRouter>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <DarkModeProvider>
        <AppShell />
      </DarkModeProvider>
    </React.StrictMode>
  );
}
