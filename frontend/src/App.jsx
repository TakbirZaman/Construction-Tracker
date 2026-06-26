import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { WSProvider } from './context/WSContext.jsx';
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
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
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

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
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
    </>
  );
}
