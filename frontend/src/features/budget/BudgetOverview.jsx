import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { projectsAPI, budgetAPI } from '../../api/index.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/index.jsx';
import { formatCurrency, categoryConfig } from '../../utils/helpers.js';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function BudgetOverview() {
  const [projects, setProjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getAll().then(async ({ data }) => {
      setProjects(data);
      const summaryMap = {};
      await Promise.all(data.map(async p => {
        try {
          const { data: s } = await budgetAPI.getSummary(p.id);
          summaryMap[p.id] = s;
        } catch {}
      }));
      setSummaries(summaryMap);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalPlanned = Object.values(summaries).reduce((sum, s) => sum + parseFloat(s.total_planned || 0), 0);
  const totalActual = Object.values(summaries).reduce((sum, s) => sum + parseFloat(s.total_actual || 0), 0);
  const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
  const overBudgetCount = Object.values(summaries).filter(s => parseFloat(s.total_actual) > parseFloat(s.total_planned)).length;

  const chartData = projects.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    Budget: parseFloat(p.budget) / 1000,
    Actual: parseFloat(summaries[p.id]?.total_actual || 0) / 1000,
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Budget Overview"
        subtitle="Financial performance across all projects"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget, true), color: 'text-brand-600', icon: '🏦' },
          { label: 'Total Planned', value: formatCurrency(totalPlanned, true), color: 'text-slate-700', icon: '📋' },
          { label: 'Total Spent', value: formatCurrency(totalActual, true), color: totalActual > totalPlanned ? 'text-rose-600' : 'text-emerald-600', icon: '💸' },
          { label: 'Over Budget', value: overBudgetCount, color: overBudgetCount > 0 ? 'text-rose-600' : 'text-emerald-600', icon: '⚠' },
        ].map(s => (
          <div key={s.label} className="px-4 sm:px-6 py-4 border-r border-slate-100 dark:border-slate-700/50 last:border-r-0 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <>
            {chartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Budget vs Actual by Project (000s)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}K`} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      formatter={(v, name) => [`৳${(v * 1000).toLocaleString()}`, name]} />
                    <Bar dataKey="Budget" fill="#c4b5fd" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Actual" fill="#E1306C" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {projects.map(p => {
                const s = summaries[p.id];
                if (!s) return null;
                const isOver = parseFloat(s.total_actual) > parseFloat(s.total_planned);
                const utilPct = parseFloat(s.utilization_percentage) || 0;
                return (
                  <motion.div key={p.id} variants={item} className="card p-5 hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link to={`/projects/${p.id}`} className="font-bold text-slate-800 hover:text-brand-600 transition-colors">{p.name}</Link>
                        <StatusBadge status={p.status} />
                        {isOver && <span className="badge bg-rose-50 text-rose-600 border border-rose-200 text-xs">⚠ Over Budget</span>}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Budget: <span className="text-slate-700 font-mono font-bold">{formatCurrency(p.budget, true)}</span></span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
                      {[
                        { label: 'Planned', value: formatCurrency(s.total_planned, true), color: 'text-slate-700' },
                        { label: 'Actual', value: formatCurrency(s.total_actual, true), color: isOver ? 'text-rose-600' : 'text-emerald-600' },
                        { label: 'Variance', value: `${isOver ? '-' : '+'}${formatCurrency(Math.abs(s.variance || 0), true)}`, color: isOver ? 'text-rose-600' : 'text-emerald-600' },
                        { label: 'Utilization', value: `${utilPct}%`, color: utilPct > 100 ? 'text-rose-600' : utilPct > 80 ? 'text-amber-600' : 'text-emerald-600' },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-xs text-slate-400 mb-1 font-medium">{item.label}</div>
                          <div className={`font-mono font-bold ${item.color}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, utilPct)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${isOver ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`}
                      />
                    </div>

                    {s.byCategory?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {s.byCategory.map(c => {
                          const cfg = categoryConfig[c.category];
                          return (
                            <span key={c.category} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                              style={{ background: `${cfg?.color}10`, color: cfg?.color, border: `1px solid ${cfg?.color}20` }}>
                              {cfg?.icon} {cfg?.label}: {formatCurrency(c.actual, true)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
