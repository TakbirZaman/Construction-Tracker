import React from 'react';
import { statusConfig, priorityConfig, getProgressColor, getProgressGradient } from '../../utils/helpers.js';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-[3px] border-purple-100 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
        className={`relative ${sizes[size]} w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`badge ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── PriorityBadge ────────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const cfg = priorityConfig[priority] || { label: priority, color: 'bg-slate-50 text-slate-600 border border-slate-200' };
  const dots = { low: '●', medium: '●●', high: '●●●', critical: '⚠' };
  return <span className={`badge ${cfg.color}`}>{dots[priority]} {cfg.label}</span>;
};

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, showLabel = true, height = 'h-2', className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className={`flex-1 bg-slate-100 rounded-full ${height} overflow-hidden`}>
      <motion.div
        className={`${height} rounded-full bg-gradient-to-r ${getProgressGradient(value)}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
    {showLabel && <span className="text-xs text-slate-500 font-mono font-medium w-10 text-right">{Math.round(value || 0)}%</span>}
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="text-6xl mb-5 animate-float">{icon}</div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>
    {action}
  </motion.div>
);

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-slate-500 text-sm mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>
        {danger ? '🗑 Delete' : 'Confirm'}
      </button>
    </div>
  </Modal>
);

// ─── Alert ────────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const cfg = {
    info:    'bg-brand-50 border-brand-200 text-brand-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error:   'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${cfg[type]} ${className}`}
    >
      <span className="flex items-center gap-2"><span>{icons[type]}</span> {message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>}
    </motion.div>
  );
};

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormField = ({ label, error, children, required }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="label">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>}
    {children}
    {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = 'text-brand-600', trend, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className={`stat-card ${gradient || ''} group cursor-default`}
  >
    <div className="flex items-start justify-between">
      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
      {trend != null && (
        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <div className={`text-2xl font-display font-bold tracking-tight ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '', count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`skeleton ${className}`} />
    ))}
  </div>
);

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export const Tooltip = ({ children, text }) => (
  <div className="relative group/tip inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

// ─── DarkModeToggle ───────────────────────────────────────────────────────────
export const DarkModeToggle = ({ dark, onToggle }) => (
  <button
    onClick={onToggle}
    className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
    aria-label="Toggle dark mode"
  >
    <motion.div
      className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-sm"
      animate={{ x: dark ? 28 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {dark ? '🌙' : '☀️'}
    </motion.div>
  </button>
);

// ─── Toast Container (using react-hot-toast) ──────────────────────────────────
export { default as Toaster } from 'react-hot-toast';
