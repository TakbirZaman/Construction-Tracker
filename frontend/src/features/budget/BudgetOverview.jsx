import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectsAPI, budgetAPI } from '../../api/index.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/index.jsx';
import { formatCurrency, categoryConfig } from '../../utils/helpers.js';

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

      <div className="grid grid-cols-4 border-b border-slate-800">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget, true), color: 'text-blue-400' },
          { label: 'Total Planned', value: formatCurrency(totalPlanned, true), color: 'text-slate-300' },
          { label: 'Total Spent', value: formatCurrency(totalActual, true), color: totalActual > totalPlanned ? 'text-red-400' : 'text-green-400' },
          { label: 'Over Budget', value: overBudgetCount, color: overBudgetCount > 0 ? 'text-red-400' : 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="px-6 py-4 border-r border-slate-800 last:border-r-0 text-center">
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Chart */}
            {chartData.length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Budget vs Actual by Project (000s)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}K`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      formatter={(v, name) => [`৳${(v * 1000).toLocaleString()}`, name]} />
                    <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.7} />
                    <Bar dataKey="Actual" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Per-project breakdown */}
            <div className="space-y-4">
              {projects.map(p => {
                const s = summaries[p.id];
                if (!s) return null;
                const isOver = parseFloat(s.total_actual) > parseFloat(s.total_planned);
                const utilPct = parseFloat(s.utilization_percentage) || 0;
                return (
                  <div key={p.id} className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Link to={`/projects/${p.id}`} className="font-semibold text-slate-200 hover:text-white">{p.name}</Link>
                        <StatusBadge status={p.status} />
                        {isOver && <span className="badge bg-red-500/20 text-red-400 text-xs">⚠ Over Budget</span>}
                      </div>
                      <span className="text-xs text-slate-500">Budget: <span className="text-slate-300 font-mono">{formatCurrency(p.budget, true)}</span></span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      {[
                        { label: 'Planned', value: formatCurrency(s.total_planned, true), color: 'text-slate-300' },
                        { label: 'Actual', value: formatCurrency(s.total_actual, true), color: isOver ? 'text-red-400' : 'text-green-400' },
                        { label: 'Variance', value: `${isOver ? '-' : '+'}${formatCurrency(Math.abs(s.variance || 0), true)}`, color: isOver ? 'text-red-400' : 'text-green-400' },
                        { label: 'Utilization', value: `${utilPct}%`, color: utilPct > 100 ? 'text-red-400' : utilPct > 80 ? 'text-yellow-400' : 'text-green-400' },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                          <div className={`font-mono font-bold ${item.color}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(100, utilPct)}%` }} />
                    </div>

                    {/* Category breakdown */}
                    {s.byCategory?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {s.byCategory.map(c => {
                          const cfg = categoryConfig[c.category];
                          return (
                            <span key={c.category} className="text-xs px-2 py-1 rounded-full"
                              style={{ background: `${cfg?.color}15`, color: cfg?.color }}>
                              {cfg?.icon} {cfg?.label}: {formatCurrency(c.actual, true)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
