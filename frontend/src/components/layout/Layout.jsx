import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWS } from '../../context/WSContext.jsx';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin', 'manager', 'worker'] },
  { to: '/projects', icon: '🏗️', label: 'Projects', roles: ['admin', 'manager', 'worker'] },
  { to: '/my-tasks', icon: '✅', label: 'My Tasks', roles: ['worker', 'manager'] },
  { to: '/materials', icon: '📦', label: 'Materials', roles: ['admin', 'manager'] },
  { to: '/budget', icon: '💰', label: 'Budget', roles: ['admin', 'manager'] },
  { to: '/admin', icon: '👑', label: 'Admin Panel', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout, canManage, isAdmin } = useAuth();
  const { connected } = useWS();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const visibleNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 min-h-[73px]">
          <img
            src="https://www.nnsel.com/assets/nnsel-B5wYGJs_.png"
            alt="Logo"
            className="w-8 h-8 object-contain flex-shrink-0 rounded"
          />
          {!collapsed && (
            <div>
              <div className="font-display font-bold text-sm tracking-widest text-white uppercase">Construction Tracker</div>
              <div className="text-xs text-slate-500 font-mono">Pro ERP</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-white transition-colors p-1 rounded"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 relative
                 ${isActive
                   ? 'text-brand-400 bg-brand-500/10 border-r-2 border-brand-500'
                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                 }`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 p-3">
          {/* WS Status */}
          <div className={`flex items-center gap-2 px-2 py-1 mb-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {!collapsed && <span className="text-xs text-slate-500">{connected ? 'Live' : 'Offline'}</span>}
          </div>

          {/* User info */}
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-base flex-shrink-0 border border-slate-700">
              {user?.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={`mt-2 w-full flex items-center gap-2 px-2 py-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}
