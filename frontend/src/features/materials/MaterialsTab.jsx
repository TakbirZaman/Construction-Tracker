import React, { useState, useEffect } from 'react';
import { materialsAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Modal, EmptyState, ConfirmDialog, FormField, Spinner } from '../../components/ui/index.jsx';
import { formatCurrency } from '../../utils/helpers.js';

const EMPTY_FORM = { name: '', unit: 'units', quantity_ordered: '', quantity_used: '', unit_cost: '', supplier: '', notes: '' };
const UNITS = ['units', 'kg', 'tons', 'meters', 'sq meters', 'cubic meters', 'liters', 'pieces', 'rolls', 'bags', 'sets'];

export default function MaterialsTab({ projectId }) {
  const { canManage } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        materialsAPI.getByProject(projectId),
        materialsAPI.getSummary(projectId),
      ]);
      setMaterials(mRes.data);
      setSummary(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };
  const openEdit = (m) => {
    setEditItem(m);
    setForm({ name: m.name, unit: m.unit, quantity_ordered: m.quantity_ordered,
      quantity_used: m.quantity_used, unit_cost: m.unit_cost, supplier: m.supplier || '', notes: m.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Material name is required');
    setSaving(true); setError('');
    try {
      if (editItem) {
        await materialsAPI.update(projectId, editItem.id, form);
        toast.success('Material updated!');
      } else {
        await materialsAPI.create(projectId, form);
        toast.success('Material added!');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await materialsAPI.delete(projectId, deleteId);
      setDeleteId(null);
      toast.success('Material deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = materials.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()) || (m.supplier || '').toLowerCase().includes(filter.toLowerCase()));

  const stockStatus = (m) => {
    if (parseFloat(m.quantity_used) > parseFloat(m.quantity_ordered)) return { label: '⚠ Over Usage', color: 'bg-rose-50 text-rose-600 border border-rose-200' };
    if (parseFloat(m.usage_percentage) >= 90) return { label: '⚠ Low Stock', color: 'bg-amber-50 text-amber-600 border border-amber-200' };
    return { label: '✓ OK', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' };
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div>
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Materials', value: summary.total_materials, color: 'text-slate-700', icon: '📦' },
            { label: 'Total Value', value: formatCurrency(summary.total_material_value, true), color: 'text-brand-600', icon: '💰' },
            { label: 'Low Stock', value: summary.low_stock_count, color: 'text-amber-600', icon: '⚠' },
            { label: 'Over Usage', value: summary.over_usage_count, color: 'text-rose-600', icon: '🚨' },
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

      <div className="flex items-center justify-between gap-3 mb-5">
        <input className="input w-52" placeholder="Search materials..." value={filter} onChange={e => setFilter(e.target.value)} />
        {canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Material</button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="No materials tracked" description="Add materials to track inventory and costs"
          action={canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Material</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50">
                {['Material', 'Unit', 'Ordered', 'Used', 'Remaining', 'Usage %', 'Unit Cost', 'Total Cost', 'Supplier', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const status = stockStatus(m);
                return (
                  <tr key={m.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-700">{m.name}</div>
                      {m.notes && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{m.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.unit}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{parseFloat(m.quantity_ordered).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{parseFloat(m.quantity_used).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{parseFloat(m.quantity_remaining).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${parseFloat(m.usage_percentage) > 100 ? 'bg-rose-500' : parseFloat(m.usage_percentage) >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, parseFloat(m.usage_percentage))}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-400">{m.usage_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{formatCurrency(m.unit_cost)}</td>
                    <td className="px-4 py-3 font-mono text-brand-600 font-bold">{formatCurrency(m.total_cost, true)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{m.supplier || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs px-2 py-1 rounded-full font-semibold ${status.color}`}>{status.label}</span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(m)} className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 text-xs transition-all font-medium">Edit</button>
                          <button onClick={() => setDeleteId(m.id)} className="text-rose-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 text-xs transition-all font-medium">Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200/80 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50">
                <td className="px-4 py-3 text-xs font-bold text-slate-500" colSpan={7}>Total Material Cost</td>
                <td className="px-4 py-3 font-mono font-bold text-brand-600">
                  {formatCurrency(filtered.reduce((sum, m) => sum + parseFloat(m.total_cost || 0), 0), true)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Material' : 'Add Material'} size="lg">
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Material Name" required>
              <input className="input" placeholder="e.g. Structural Steel Beams" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Unit">
            <select className="select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </FormField>
          <FormField label="Unit Cost (৳)">
            <input className="input" type="number" step="0.01" placeholder="0" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value }))} />
          </FormField>
          <FormField label="Quantity Ordered">
            <input className="input" type="number" step="0.01" placeholder="0" value={form.quantity_ordered} onChange={e => setForm(f => ({ ...f, quantity_ordered: e.target.value }))} />
          </FormField>
          <FormField label="Quantity Used">
            <input className="input" type="number" step="0.01" placeholder="0" value={form.quantity_used} onChange={e => setForm(f => ({ ...f, quantity_used: e.target.value }))} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Supplier">
              <input className="input" placeholder="Supplier name" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Notes">
              <textarea className="input resize-none h-16" placeholder="Additional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editItem ? '✓ Update' : '＋ Add Material'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Material" danger message="Delete this material entry?" />
    </div>
  );
}
