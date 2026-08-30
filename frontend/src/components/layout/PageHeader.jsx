import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="border-b border-slate-700/50 px-4 sm:px-8 py-5 sm:py-6 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20">
      {breadcrumb && (
        <div className="text-xs text-slate-500 mb-2.5 flex items-center gap-1.5 font-medium">{breadcrumb}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl sm:text-2xl font-display font-bold tracking-wide text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </motion.div>
        {actions && <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-3 flex-wrap"
        >
          {actions}
        </motion.div>}
      </div>
    </div>
  );
}
