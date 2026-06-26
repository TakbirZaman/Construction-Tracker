import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Modal, EmptyState, ConfirmDialog, FormField, Spinner, StatCard, Alert } from '../../components/ui/index.jsx';
import { formatDate, formatRelative } from '../../utils/helpers.js';

const ROLES = ['admin', 'manager', 'worker'];
const AVATARS = ['👑', '👩‍💼', '🧑‍💼', '👷', '👩‍🔧', '🔧', '🧱', '🏗️', '⚙️', '📐'];
const EMPTY_FORM = { name: '', email: '', password: '', role: 'worker', avatar: '👷' };

const ROLE_COLORS = {
  admin: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
  manager: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  worker: 'bg-green-500/20 text-green-400 border border-green-500/30',
};

export default function AdminPanel() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deactivateId, setDeactivateId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    load();
  }, [isAdmin]);

  const load = () => {
    setLoading(true);
    usersAPI.getAll()
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditUser(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, avatar: u.avatar });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return setError('Name and email are required');
    if (!editUser && !form.password) return setError('Password is required for new users');
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (editUser && !payload.password) delete payload.password;
      if (editUser) await usersAPI.update(editUser.id, payload);
      else await usersAPI.create(payload);
      setModalOpen(false);
      setSuccessMsg(editUser ? 'User updated successfully' : 'User created successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    try {
      await usersAPI.delete(deactivateId);
      setDeactivateId(null);
      setSuccessMsg('User deactivated');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to deactivate'); }
  };

  const handleToggleActive = async (u) => {
    try {
      await usersAPI.update(u.id, { is_active: !u.is_active });
      load();
    } catch { alert('Failed to update'); }
  };

  const filtered = users.filter(u => {
    const matchText = u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchText && matchRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    workers: users.filter(u => u.role === 'worker').length,
    active: users.filter(u => u.is_active).length,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Admin Panel 👑"
        subtitle="User management and system administration"
        actions={<button className="btn-primary" onClick={openCreate}>＋ Add User</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-5 border-b border-slate-800">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-300' },
          { label: 'Admins', value: stats.admins, color: 'text-brand-400' },
          { label: 'Managers', value: stats.managers, color: 'text-blue-400' },
          { label: 'Workers', value: stats.workers, color: 'text-green-400' },
          { label: 'Active', value: stats.active, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="px-6 py-4 border-r border-slate-800 last:border-r-0 text-center">
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-8">
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-5 animate-fade-in">
            ✓ {successMsg}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <input className="input w-60" placeholder="Search by name or email..." value={filter} onChange={e => setFilter(e.target.value)} />
          <select className="select w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="ml-auto text-sm text-slate-500">{filtered.length} users</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {['User', 'Email', 'Role', 'Projects', 'Tasks', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={`table-row ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-lg border border-slate-700">
                          {u.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{u.name}</div>
                          {u.id === user?.id && <span className="text-xs text-brand-400">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{u.project_count || 0}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{u.task_count || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => u.id !== user?.id && handleToggleActive(u)}
                        disabled={u.id === user?.id}
                        className={`badge cursor-pointer transition-all ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} ${u.id === user?.id ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'}`}
                      >
                        {u.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 text-xs transition-colors">
                          Edit
                        </button>
                        {u.id !== user?.id && (
                          <button onClick={() => setDeactivateId(u.id)} className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 text-xs transition-colors">
                            Del
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Create User'} size="md">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" required>
            <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Email Address" required>
            <input className="input" type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </FormField>
          <FormField label={editUser ? 'New Password (leave blank to keep)' : 'Password'} required={!editUser}>
            <input className="input" type="password" placeholder={editUser ? '(unchanged)' : 'Min. 6 characters'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </FormField>
          <FormField label="Role">
            <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </FormField>
          <FormField label="Avatar">
            <div className="flex gap-2 flex-wrap mt-1">
              {AVATARS.map(a => (
                <button key={a} type="button"
                  onClick={() => setForm(f => ({ ...f, avatar: a }))}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${form.avatar === a ? 'bg-brand-500/30 border-2 border-brand-500' : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editUser ? '✓ Update User' : '＋ Create User'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deactivateId} onClose={() => setDeactivateId(null)} onConfirm={handleDeactivate}
        title="Deactivate User" danger message="This will deactivate the user account. They won't be able to log in." />
    </div>
  );
}
