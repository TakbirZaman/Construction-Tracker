import React, { useState, useEffect } from 'react';
import { tasksAPI, usersAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Modal, StatusBadge, PriorityBadge, ProgressBar, EmptyState, ConfirmDialog, FormField, Alert, Spinner } from '../../components/ui/index.jsx';
import { formatDate } from '../../utils/helpers.js';

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'blocked'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const EMPTY_FORM = { title: '', description: '', status: 'pending', priority: 'medium', progress: 0, assigned_to: '', due_date: '', notes: '' };

export default function TasksTab({ projectId, onUpdate }) {
  const { canManage, user, isWorker } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [inlineEdit, setInlineEdit] = useState({});

  const load = () => {
    setLoading(true);
    tasksAPI.getByProject(projectId)
      .then(({ data }) => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);
  useEffect(() => {
    if (canManage) usersAPI.getWorkers().then(({ data }) => setWorkers(data));
  }, [canManage]);

  const openCreate = () => { setEditTask(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };
  const openEdit = (t) => {
    setEditTask(t);
    setForm({ title: t.title, description: t.description || '', status: t.status, priority: t.priority,
      progress: t.progress, assigned_to: t.assigned_to || '', due_date: t.due_date?.split('T')[0] || '', notes: t.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setError('Task title is required');
    setSaving(true); setError('');
    try {
      if (editTask) {
        await tasksAPI.update(projectId, editTask.id, form);
        toast.success('Task updated!');
      } else {
        await tasksAPI.create(projectId, form);
        toast.success('Task created!');
      }
      setModalOpen(false);
      load();
      onUpdate?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally { setSaving(false); }
  };

  const handleInlineUpdate = async (task, field, value) => {
    setInlineEdit(prev => ({ ...prev, [task.id]: true }));
    try {
      let update = { [field]: value };
      if (field === 'status') {
        if (value === 'completed') update.progress = 100;
        if (value === 'pending') update.progress = 0;
      }
      await tasksAPI.update(projectId, task.id, update);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...update } : t));
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setInlineEdit(prev => { const n = { ...prev }; delete n[task.id]; return n; });
    }
  };

  const handleDelete = async () => {
    try {
      await tasksAPI.delete(projectId, deleteId);
      setDeleteId(null);
      toast.success('Task deleted');
      load();
      onUpdate?.();
    } catch (err) { toast.error('Failed to delete task'); }
  };

  const filtered = tasks.filter(t => {
    const matchText = t.title.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchText && matchStatus;
  });

  const grouped = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = filtered.filter(t => t.status === s);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <input className="input w-52" placeholder="Search tasks..." value={filter} onChange={e => setFilter(e.target.value)} />
          <select className="select w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        {canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Task</button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="✅" title="No tasks yet" description="Add tasks to track work progress"
          action={canManage && <button className="btn-primary" onClick={openCreate}>＋ Add Task</button>} />
      ) : (
        <div className="space-y-6">
          {STATUS_OPTIONS.filter(s => !statusFilter || s === statusFilter).map(status => {
            const group = grouped[status];
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status={status} />
                  <span className="text-xs text-slate-400 font-mono font-semibold">{group.length}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-2">
                  {group.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      workers={workers}
                      canManage={canManage}
                      isWorker={isWorker}
                      userId={user?.id}
                      loading={!!inlineEdit[task.id]}
                      onInlineUpdate={handleInlineUpdate}
                      onEdit={() => openEdit(task)}
                      onDelete={() => setDeleteId(task.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'New Task'} size="lg">
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Task Title" required>
              <input className="input" placeholder="e.g. Foundation Excavation" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Description">
              <textarea className="input resize-none h-20" placeholder="Task details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Status">
            <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Progress (%)">
            <input className="input" type="number" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} />
          </FormField>
          <FormField label="Due Date">
            <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </FormField>
          {canManage && (
            <div className="col-span-2">
              <FormField label="Assign To">
                <select className="select" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                  <option value="">— Unassigned —</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.avatar} {w.name} ({w.role})</option>)}
                </select>
              </FormField>
            </div>
          )}
          <div className="col-span-2">
            <FormField label="Notes">
              <textarea className="input resize-none h-16" placeholder="Additional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editTask ? '✓ Update Task' : '＋ Create Task'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Task" danger message="Are you sure you want to delete this task?" />
    </div>
  );
}

function TaskRow({ task, workers, canManage, isWorker, userId, loading, onInlineUpdate, onEdit, onDelete }) {
  const canEdit = canManage || (isWorker && task.assigned_to === userId);

  return (
    <div className={`card p-4 flex items-center gap-4 group transition-all duration-300 hover:shadow-medium ${loading ? 'opacity-60' : ''}`}>
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
        task.priority === 'critical' ? 'bg-rose-500' :
        task.priority === 'high' ? 'bg-orange-500' :
        task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
      }`} />

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700 text-sm">{task.title}</span>
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <span className="text-xs text-slate-400">📅 {formatDate(task.due_date)}</span>
          )}
        </div>
        {task.description && <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>}
        <ProgressBar value={task.progress} height="h-1" />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {canEdit ? (
          <select
            className="select w-36 text-xs py-1.5"
            value={task.status}
            onChange={e => onInlineUpdate(task, 'status', e.target.value)}
            disabled={loading}
          >
            {['pending','in_progress','completed','blocked'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        ) : <StatusBadge status={task.status} />}

        {canEdit && (
          <input
            type="number" min="0" max="100"
            className="input w-16 text-xs py-1.5 text-center font-mono"
            value={task.progress}
            onChange={e => onInlineUpdate(task, 'progress', parseInt(e.target.value) || 0)}
            disabled={loading}
          />
        )}

        {task.assignee_avatar && (
          <div className="w-7 h-7 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center text-sm border border-white shadow-sm" title={task.assignee_name}>
            {task.assignee_avatar}
          </div>
        )}

        {canManage && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 text-xs transition-all font-medium">Edit</button>
            <button onClick={onDelete} className="text-rose-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 text-xs transition-all font-medium">Del</button>
          </div>
        )}
      </div>
    </div>
  );
}
