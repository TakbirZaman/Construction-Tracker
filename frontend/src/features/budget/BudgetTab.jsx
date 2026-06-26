import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { budgetAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal, EmptyState, ConfirmDialog, FormField, Spinner } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate, categoryConfig } from '../../utils/helpers.js';

const CATEGORIES = ['labor', 'materials', 'equipment', 'overhead', 'other'];
const EMPTY_FORM = { category: 'labor', description: '', planned_cost: '', actual_cost: '', date: '', notes: '' };

export default function BudgetTab({ projectId, projectBudget }) {
  const { canManage } = useAuth();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        budgetAPI.getByProject(projectId),
        budgetAPI.getSummary(projectId),
      ]);
      setEntries(eRes.data);
      setSummary(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };
  const openEdit = (e) => {
    setEditItem(e);
    setForm({ category: e.category, description: e.description, planned_cost: e.planned_cost,
      actual_cost: e.actual_cost, date: e.date?.split('T')[0] || '', notes: e.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.description.trim()) return setError('Description is required');
    setSaving(true); setError('');
    try {
      if (editItem) await budgetAPI.update(projectId, editItem.id, form);
      else await budgetAPI.create(projectId, form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await budgetAPI.delete(projectId, deleteId);
      setDeleteId(null);
      load();
    } catch { alert('Failed to delete'); }
  };

  const chartData = summary?.byCategory?.map(c => ({
    name: categoryConfig[c.category]?.label || c.category,
    Planned: parseFloat(c.planned) / 1000,
    Actual: parseFloat(c.actual) / 1000,
    color: categoryConfig[c.category]?.color,
  })) || [];

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  const isOverBudget = summary && parseFloat(summary.total_actual) > parseFloat(summary.total_planned);

  return (
    <div>
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Project Budget', value: formatCurrency(summary.project_budget, true), color: 'text-blue-400', icon: '🏦' },
            { label: 'Total Planned', value: formatCurrency(summary.total_planned, true), color: 'text-slate-300', icon: '📋' },
            { label: 'Total Actual', value: formatCurrency(summary.total_actual, true), color: isOverBudget ? 'text-red-400' : 'text-green-400', icon: '💸' },
            { label: 'Variance', value: `${isOverBudget ? '-' : '+'}${formatCurrency(Math.abs(summary.variance || 0), true)}`, color: isOverBudget ? 'text-red-400' : 'text-green-400', icon: isOverBudget ? '📉' : '📈' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget utilization bar */}
      {summary && (
        <div className="card p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Budget Utilization</span>
            <span className={`font-mono text-sm font-bold ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
              {summary.utilization_percentage}%
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? 'bg-red-500' : 'bg-brand-500'}`}
              style={{ width: `${Math.min(100, parseFloat(summary.utilization_percentage))}%` }}
            />
          </div>
          {isOverBudget && (
            <p className="text-xs text-red-400 mt-2">⚠ Project is over budget by {formatCurrency(Math.abs(summary.variance || 0))}</p>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Cost by Category (000s)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v, name) => [`৳${(v * 1000).toLocaleString()}`, name]} />
              <Bar dataKey="Planned" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="Actual" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {summary?.byCategory?.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {summary.byCategory.map(c => {
              const cfg = categoryConfig[c.category] || { label: c.category, icon: '📦', color: '#6b7280' };
              const overCat = parseFloat(c.actual) > parseFloat(c.planned);
              return (
                <div key={c.category} className="flex items-center gap-4">
                  <span className="text-lg w-6">{cfg.icon}</span>
                  <span className="text-sm text-slate-400 w-24">{cfg.label}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Planned: {formatCurrency(c.planned, true)}</span>
                      <span className={overCat ? 'text-red-400' : 'text-green-400'}>Actual: {formatCurrency(c.actual, true)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, parseFloat(c.planned) > 0 ? (parseFloat(c.actual) / parseFloat(c.planned)) * 100 : 0)}%`,
                          background: overCat ? '#ef4444' : cfg.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entries table */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Budget Entries</h3>
        {canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Entry</button>}
      </div>

      {entries.length === 0 ? (
        <EmptyState icon="💰" title="No budget entries" description="Add budget entries to track costs"
          action={canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Entry</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                {['Category', 'Description', 'Date', 'Planned', 'Actual', 'Variance', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(e => {
                const cfg = categoryConfig[e.category];
                const variance = parseFloat(e.planned_cost) - parseFloat(e.actual_cost);
                return (
                  <tr key={e.id} className="table-row">
                    <td className="px-4 py-3">
                      <span className="badge" style={{ background: `${cfg?.color}20`, color: cfg?.color }}>
                        {cfg?.icon} {cfg?.label || e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{e.description}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{formatCurrency(e.planned_cost)}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{formatCurrency(e.actual_cost)}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className={variance >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(e)} className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 text-xs transition-colors">Edit</button>
                          <button onClick={() => setDeleteId(e.id)} className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 text-xs transition-colors">Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Budget Entry' : 'New Budget Entry'} size="lg">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{categoryConfig[c]?.icon} {categoryConfig[c]?.label || c}</option>)}
            </select>
          </FormField>
          <FormField label="Date">
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Description" required>
              <input className="input" placeholder="e.g. Foundation Labor Q1" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Planned Cost (৳)">
            <input className="input" type="number" step="0.01" placeholder="0" value={form.planned_cost} onChange={e => setForm(f => ({ ...f, planned_cost: e.target.value }))} />
          </FormField>
          <FormField label="Actual Cost (৳)">
            <input className="input" type="number" step="0.01" placeholder="0" value={form.actual_cost} onChange={e => setForm(f => ({ ...f, actual_cost: e.target.value }))} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Notes">
              <textarea className="input resize-none h-16" placeholder="Additional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editItem ? '✓ Update' : '＋ Add Entry'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Entry" danger message="Delete this budget entry?" />
    </div>
  );
}
