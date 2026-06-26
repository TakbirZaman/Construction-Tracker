import React from 'react';

export default function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="border-b border-slate-800 px-8 py-6 bg-slate-900/50">
      {breadcrumb && (
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">{breadcrumb}</div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-wide text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
