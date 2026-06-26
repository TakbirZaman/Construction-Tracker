import React from 'react';
import { statusConfig, priorityConfig, getProgressColor } from '../../utils/helpers.js';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative ${sizes[size]} w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-lg font-semibold font-display tracking-wide text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-500/20 text-slate-400' };
  return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
};

// ─── PriorityBadge ────────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const cfg = priorityConfig[priority] || { label: priority, color: 'bg-slate-500/20 text-slate-400' };
  const dots = { low: '●', medium: '●●', high: '●●●', critical: '⚠' };
  return <span className={`badge ${cfg.color}`}>{dots[priority]} {cfg.label}</span>;
};

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, showLabel = true, height = 'h-2', className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className={`flex-1 bg-slate-800 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ${getProgressColor(value)}`}
        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
      />
    </div>
    {showLabel && <span className="text-xs text-slate-400 font-mono w-10 text-right">{Math.round(value || 0)}%</span>}
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-slate-400 text-sm mb-6">{message}</p>
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
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm ${cfg[type]} animate-fade-in ${className}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>}
    </div>
  );
};

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormField = ({ label, error, children, required }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="label">{label}{required && <span className="text-brand-500 ml-1">*</span>}</label>}
    {children}
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = 'text-brand-400', trend }) => (
  <div className="stat-card animate-fade-in">
    <div className="flex items-start justify-between">
      <div className="text-2xl">{icon}</div>
      {trend != null && (
        <span className={`text-xs font-mono ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <div className={`text-2xl font-display font-bold tracking-tight ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </div>
  </div>
);
