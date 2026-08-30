import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsAPI, materialsAPI } from '../../api/index.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';
import { formatCurrency } from '../../utils/helpers.js';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function MaterialsOverview() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allMaterials, setAllMaterials] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    projectsAPI.getAll().then(async ({ data }) => {
      setProjects(data);
      const mats = await Promise.all(
        data.map(p => materialsAPI.getByProject(p.id).then(r => r.data.map(m => ({ ...m, project_name: p.name, project_id: p.id }))).catch(() => []))
      );
      setAllMaterials(mats.flat());
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = allMaterials.filter(m =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.project_name.toLowerCase().includes(filter.toLowerCase())
  );

  const alerts = allMaterials.filter(m => m.stock_status !== 'ok');
  const totalValue = allMaterials.reduce((sum, m) => sum + parseFloat(m.total_cost || 0), 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Materials Overview"
        subtitle="Inventory tracking across all projects"
        actions={<input className="input w-52" placeholder="Search materials..." value={filter} onChange={e => setFilter(e.target.value)} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
        {[
          { label: 'Total Materials', value: allMaterials.length, color: 'text-slate-700', icon: '📦' },
          { label: 'Total Value', value: formatCurrency(totalValue, true), color: 'text-brand-600', icon: '💰' },
          { label: 'Alerts', value: alerts.length, color: alerts.length > 0 ? 'text-rose-600' : 'text-emerald-600', icon: '⚠' },
          { label: 'Projects Tracked', value: projects.length, color: 'text-violet-600', icon: '🏗️' },
        ].map(s => (
          <div key={s.label} className="px-4 sm:px-6 py-4 border-r border-slate-100 dark:border-slate-700/50 last:border-r-0 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No materials found" description="Materials will appear here once added to projects." />
        ) : (
          <>
            {!filter && alerts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">⚠ Alerts ({alerts.length})</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {alerts.map(m => (
                    <div key={m.id} className={`card p-4 border-l-4 ${m.stock_status === 'over_usage' ? 'border-l-rose-500 bg-rose-50/50' : 'border-l-amber-500 bg-amber-50/50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-700">{m.name}</div>
                          <Link to={`/projects/${m.project_id}`} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">{m.project_name}</Link>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${m.stock_status === 'over_usage' ? 'text-rose-600' : 'text-amber-600'}`}>
                            {m.stock_status === 'over_usage' ? '🚨 Over Usage' : '⚠ Low Stock'}
                          </div>
                          <div className="text-xs text-slate-400">{m.usage_percentage}% used</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50">
                    {['Material', 'Project', 'Ordered', 'Used', 'Remaining', 'Usage', 'Unit Cost', 'Total Cost', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={`${m.project_id}-${m.id}`} className="table-row">
                      <td className="px-4 py-3 font-semibold text-slate-700">{m.name}</td>
                      <td className="px-4 py-3">
                        <Link to={`/projects/${m.project_id}`} className="text-brand-600 hover:text-brand-700 text-xs font-semibold">{m.project_name}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{parseFloat(m.quantity_ordered).toLocaleString()} {m.unit}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{parseFloat(m.quantity_used).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{parseFloat(m.quantity_remaining).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${parseFloat(m.usage_percentage) > 100 ? 'bg-rose-500' : parseFloat(m.usage_percentage) >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, parseFloat(m.usage_percentage))}%` }} />
                          </div>
                          <span className="font-mono text-xs text-slate-400">{m.usage_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{formatCurrency(m.unit_cost)}</td>
                      <td className="px-4 py-3 font-mono text-brand-600 font-bold">{formatCurrency(m.total_cost, true)}</td>
                      <td className="px-4 py-3">
                        {m.stock_status === 'over_usage' && <span className="badge bg-rose-50 text-rose-600 border border-rose-200 text-xs">🚨 Over</span>}
                        {m.stock_status === 'low_stock' && <span className="badge bg-amber-50 text-amber-600 border border-amber-200 text-xs">⚠ Low</span>}
                        {m.stock_status === 'ok' && <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs">✓ OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
