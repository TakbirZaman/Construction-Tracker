import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { StatusBadge, PriorityBadge, ProgressBar, EmptyState, Spinner } from '../../components/ui/index.jsx';
import { formatDate } from '../../utils/helpers.js';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    tasksAPI.getMyTasks()
      .then(({ data }) => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (task, field, value) => {
    setUpdating(prev => ({ ...prev, [task.id]: true }));
    try {
      let update = { [field]: value };
      if (field === 'status') {
        if (value === 'completed') update.progress = 100;
        if (value === 'pending') update.progress = 0;
      }
      await tasksAPI.update(task.project_id || 0, task.id, update);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...update } : t));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(prev => { const n = { ...prev }; delete n[task.id]; return n; });
    }
  };

  const handleNoteUpdate = async (task, notes) => {
    try {
      await tasksAPI.update(task.project_id || 0, task.id, { notes });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notes } : t));
    } catch (err) { console.error(err); }
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase()) ||
    (t.project_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`My Tasks ${user?.avatar}`}
        subtitle="Your assigned work orders and progress"
        actions={<input className="input w-52" placeholder="Search tasks..." value={filter} onChange={e => setFilter(e.target.value)} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-5 border-b border-slate-800">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-300' },
          { label: 'Pending', value: stats.pending, color: 'text-slate-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-400' },
          { label: 'Completed', value: stats.completed, color: 'text-green-400' },
          { label: 'Blocked', value: stats.blocked, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="px-6 py-4 border-r border-slate-800 last:border-r-0 text-center">
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="✅" title="No tasks assigned" description="You have no tasks assigned to you yet." />
        ) : (
          <div className="space-y-4">
            {filtered.map(task => (
              <MyTaskCard
                key={task.id}
                task={task}
                loading={!!updating[task.id]}
                onUpdate={handleUpdate}
                onNoteUpdate={handleNoteUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyTaskCard({ task, loading, onUpdate, onNoteUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [noteVal, setNoteVal] = useState(task.notes || '');
  const [savingNote, setSavingNote] = useState(false);

  const saveNote = async () => {
    setSavingNote(true);
    await onNoteUpdate(task, noteVal);
    setSavingNote(false);
  };

  const priorityBorder = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-slate-600',
  };

  return (
    <div className={`card border-l-4 ${priorityBorder[task.priority] || ''} overflow-hidden ${loading ? 'opacity-60' : ''}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-200">{task.title}</span>
              <PriorityBadge priority={task.priority} />
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                🏗️ {task.project_name}
              </span>
              {task.due_date && (
                <span className="text-xs text-slate-500">📅 Due {formatDate(task.due_date)}</span>
              )}
            </div>

            {task.description && <p className="text-sm text-slate-400">{task.description}</p>}

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ProgressBar value={task.progress} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2 flex-shrink-0 items-end">
            <select
              className="select w-40 text-xs"
              value={task.status}
              onChange={e => onUpdate(task, 'status', e.target.value)}
              disabled={loading}
            >
              {['pending','in_progress','completed','blocked'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Progress:</span>
              <input
                type="number" min="0" max="100"
                className="input w-16 text-xs py-1 text-center font-mono"
                value={task.progress}
                onChange={e => onUpdate(task, 'progress', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
              <span className="text-xs text-slate-500">%</span>
            </div>

            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              {expanded ? '▲ Less' : '▼ Notes'}
            </button>
          </div>
        </div>

        {/* Notes section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
            <label className="label">Task Notes</label>
            <textarea
              className="input resize-none h-20 mt-1"
              placeholder="Add notes about this task..."
              value={noteVal}
              onChange={e => setNoteVal(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button onClick={saveNote} disabled={savingNote} className="btn-primary text-xs">
                {savingNote ? 'Saving...' : '💾 Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
