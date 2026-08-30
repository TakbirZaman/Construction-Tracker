import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWS } from '../../context/WSContext.jsx';
import { useDarkMode } from '../../context/DarkModeContext.jsx';
import { DarkModeToggle } from '../ui/index.jsx';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { dark, toggle } = useDarkMode();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const visibleNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-300 flex-shrink-0
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 min-h-[73px]">
          <div className="w-9 h-9 bg-instagram-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-brand">
            <span className="text-white font-bold text-sm">CT</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-display font-bold text-sm tracking-wide text-white uppercase">ConstructTrack</div>
              <div className="text-xs text-slate-400 font-mono">Pro ERP</div>
            </div>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="ml-auto text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 hidden lg:block"
          >
            {collapsed ? '▶' : '◀'}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto px-2">
          <div className={`${collapsed ? '' : 'px-2'} mb-3`}>
            {!collapsed && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation</span>}
          </div>
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 relative rounded-xl mb-1
                 ${isActive
                   ? 'text-brand-400 bg-brand-500/10 font-semibold shadow-sm'
                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                 }`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-700/50 p-3">
          {/* WS Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 mb-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {!collapsed && <span className="text-xs text-slate-400">{connected ? 'Live' : 'Offline'}</span>}
          </div>

          {/* User info */}
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500/30 to-instagram-orange/20 rounded-full flex items-center justify-center text-base flex-shrink-0 border-2 border-slate-700 shadow-sm">
              {user?.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 capitalize font-medium">{user?.role}</div>
              </div>
            )}
          </div>

          {/* Dark mode toggle + Logout */}
          <div className={`flex items-center gap-2 mt-2 px-2 ${collapsed ? 'justify-center' : ''}`}>
            <DarkModeToggle dark={dark} onToggle={toggle} />
            {!collapsed && <span className="text-xs text-slate-400 flex-1">Dark mode</span>}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-900">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700/50 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-slate-700 text-slate-300">
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-instagram-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CT</span>
            </div>
            <span className="font-display font-bold text-sm text-white uppercase">ConstructTrack</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
