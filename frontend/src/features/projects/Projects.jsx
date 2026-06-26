import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Modal, StatusBadge, ProgressBar, EmptyState, ConfirmDialog, Spinner, FormField, Alert } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate } from '../../utils/helpers.js';

const STATUS_OPTIONS = ['planning', 'active', 'completed', 'on_hold'];
const EMPTY_FORM = { name: '', description: '', status: 'planning', budget: '', start_date: '', end_date: '', location: '', manager_id: '' };

export default function Projects() {
  const { canManage, isAdmin, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    setLoading(true);
    projectsAPI.getAll(statusFilter ? { status: statusFilter } : {})
      .then(({ data }) => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  useEffect(() => {
    if (canManage) usersAPI.getWorkers().then(({ data }) => setManagers(data.filter(u => u.role === 'manager' || u.role === 'admin')));
  }, [canManage]);

  const openCreate = () => { setEditProject(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProject(p);
    setForm({
      name: p.name, description: p.description || '', status: p.status,
      budget: p.budget, start_date: p.start_date?.split('T')[0] || '',
      end_date: p.end_date?.split('T')[0] || '', location: p.location || '',
      manager_id: p.manager_id || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Project name is required');
    setSaving(true); setError('');
    try {
      if (editProject) await projectsAPI.update(editProject.id, form);
      else await projectsAPI.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await projectsAPI.delete(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total projects`}
        actions={
          <div className="flex items-center gap-3">
            <input className="input w-52" placeholder="Search projects..." value={filter} onChange={e => setFilter(e.target.value)} />
            <select className="select w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {canManage && <button className="btn-primary" onClick={openCreate}>＋ New Project</button>}
          </div>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🏗️" title="No projects found" description="Create your first project to get started"
            action={canManage && <button className="btn-primary" onClick={openCreate}>＋ Create Project</button>} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div key={p.id} className="card-hover p-5 flex flex-col gap-4 animate-fade-in group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${p.id}`} className="font-semibold text-slate-200 hover:text-white text-base leading-tight line-clamp-2 block">
                      {p.name}
                    </Link>
                    {p.location && <div className="text-xs text-slate-500 mt-1">📍 {p.location}</div>}
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {p.description && <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>}

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{p.completed_tasks}/{p.total_tasks} tasks</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <div className="text-xs text-slate-500 mb-0.5">Budget</div>
                    <div className="font-mono text-slate-200 font-medium">{formatCurrency(p.budget, true)}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <div className="text-xs text-slate-500 mb-0.5">Spent</div>
                    <div className={`font-mono font-medium ${parseFloat(p.total_actual_cost) > parseFloat(p.budget) ? 'text-red-400' : 'text-slate-200'}`}>
                      {formatCurrency(p.total_actual_cost, true)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {p.manager_avatar && <span>{p.manager_avatar}</span>}
                    <span>{p.manager_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link to={`/projects/${p.id}`} className="text-xs text-brand-400 hover:text-brand-300 px-2 py-1 rounded hover:bg-brand-500/10 transition-colors">
                      View →
                    </Link>
                    {canManage && (
                      <>
                        <button onClick={() => openEdit(p)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors">Edit</button>
                        {isAdmin && <button onClick={() => setDeleteId(p.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Del</button>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Edit Project' : 'New Project'} size="lg">
        {error && <Alert type="error" message={error} className="mb-4" />}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Project Name" required>
              <input className="input" placeholder="e.g. Skyline Tower Complex" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Description">
              <textarea className="input resize-none h-20" placeholder="Project overview..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Status">
            <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </FormField>
          <FormField label="Budget (৳)">
            <input className="input" type="number" placeholder="0" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
          </FormField>
          <FormField label="Start Date">
            <input className="input" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </FormField>
          <FormField label="End Date">
            <input className="input" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Location">
              <input className="input" placeholder="e.g. Downtown Metro District" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Project Manager">
              <select className="select" value={form.manager_id} onChange={e => setForm(f => ({ ...f, manager_id: e.target.value }))}>
                <option value="">— Select Manager —</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name} ({m.role})</option>)}
              </select>
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : (editProject ? '✓ Update Project' : '＋ Create Project')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Project" danger
        message="Are you sure? This will permanently delete the project and all its tasks, materials, and budget entries."
      />
    </div>
  );
}
