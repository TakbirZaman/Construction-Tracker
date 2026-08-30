import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { budgetAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
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
      if (editItem) {
        await budgetAPI.update(projectId, editItem.id, form);
        toast.success('Entry updated!');
      } else {
        await budgetAPI.create(projectId, form);
        toast.success('Entry added!');
      }
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
      toast.success('Entry deleted');
      load();
    } catch { toast.error('Failed to delete'); }
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
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Project Budget', value: formatCurrency(summary.project_budget, true), color: 'text-brand-600', icon: '🏦' },
            { label: 'Total Planned', value: formatCurrency(summary.total_planned, true), color: 'text-slate-700', icon: '📋' },
            { label: 'Total Actual', value: formatCurrency(summary.total_actual, true), color: isOverBudget ? 'text-rose-600' : 'text-emerald-600', icon: '💸' },
            { label: 'Variance', value: `${isOverBudget ? '-' : '+'}${formatCurrency(Math.abs(summary.variance || 0), true)}`, color: isOverBudget ? 'text-rose-600' : 'text-emerald-600', icon: isOverBudget ? '📉' : '📈' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="card p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500 font-medium">Budget Utilization</span>
            <span className={`font-mono text-sm font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
              {summary.utilization_percentage}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, parseFloat(summary.utilization_percentage))}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${isOverBudget ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`}
            />
          </div>
          {isOverBudget && (
            <p className="text-xs text-rose-500 mt-2 font-medium">⚠ Project is over budget by {formatCurrency(Math.abs(summary.variance || 0))}</p>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Cost by Category (000s)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}K`} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                formatter={(v, name) => [`৳${(v * 1000).toLocaleString()}`, name]} />
              <Bar dataKey="Planned" fill="#93c5fd" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Actual" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {summary?.byCategory?.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {summary.byCategory.map(c => {
              const cfg = categoryConfig[c.category] || { label: c.category, icon: '📦', color: '#6b7280' };
              const overCat = parseFloat(c.actual) > parseFloat(c.planned);
              return (
                <div key={c.category} className="flex items-center gap-4">
                  <span className="text-lg w-6">{cfg.icon}</span>
                  <span className="text-sm text-slate-500 w-24 font-medium">{cfg.label}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
                      <span>Planned: {formatCurrency(c.planned, true)}</span>
                      <span className={overCat ? 'text-rose-500' : 'text-emerald-500'}>Actual: {formatCurrency(c.actual, true)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, parseFloat(c.planned) > 0 ? (parseFloat(c.actual) / parseFloat(c.planned)) * 100 : 0)}%`,
                          background: overCat ? '#f43f5e' : cfg.color
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

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Budget Entries</h3>
        {canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Entry</button>}
      </div>

      {entries.length === 0 ? (
        <EmptyState icon="💰" title="No budget entries" description="Add budget entries to track costs"
          action={canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Entry</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50">
                {['Category', 'Description', 'Date', 'Planned', 'Actual', 'Variance', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
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
                      <span className="badge" style={{ background: `${cfg?.color}10`, color: cfg?.color, border: `1px solid ${cfg?.color}30` }}>
                        {cfg?.icon} {cfg?.label || e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{e.description}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{formatCurrency(e.planned_cost)}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{formatCurrency(e.actual_cost)}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className={variance >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(e)} className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 text-xs transition-all font-medium">Edit</button>
                          <button onClick={() => setDeleteId(e.id)} className="text-rose-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 text-xs transition-all font-medium">Del</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Budget Entry' : 'New Budget Entry'} size="lg">
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>}
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
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
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
