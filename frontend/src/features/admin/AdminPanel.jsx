import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Modal, EmptyState, ConfirmDialog, FormField, Spinner, Alert } from '../../components/ui/index.jsx';
import { formatDate, departmentConfig } from '../../utils/helpers.js';

const ROLES = ['admin', 'manager', 'worker'];
const AVATARS = ['👑', '👩‍💼', '🧑‍💼', '👷', '👩‍🔧', '🔧', '🧱', '🏗️', '⚙️', '📐'];
const DEPARTMENTS = ['engineering', 'procurement', 'site_ops', 'finance', 'hr', 'safety', 'design'];
const EMPTY_FORM = { name: '', email: '', password: '', role: 'worker', avatar: '👷', phone: '', department: '', employee_id: '', location: '' };

const ROLE_COLORS = {
  admin: 'bg-violet-50 text-violet-700 border border-violet-200',
  manager: 'bg-brand-50 text-brand-700 border border-brand-200',
  worker: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminPanel() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
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
    setForm({
      name: u.name, email: u.email, password: '', role: u.role, avatar: u.avatar,
      phone: u.phone || '', department: u.department || '', employee_id: u.employee_id || '', location: u.location || ''
    });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return setError('Name and email are required');
    if (!editUser && !form.password) return setError('Password is required for new users');
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (editUser && !payload.password) delete payload.password;
      if (editUser) {
        await usersAPI.update(editUser.id, payload);
        toast.success('User updated!');
      } else {
        await usersAPI.create(payload);
        toast.success('User created!');
      }
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
      toast.success('User deactivated');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to deactivate'); }
  };

  const handleToggleActive = async (u) => {
    try {
      await usersAPI.update(u.id, { is_active: !u.is_active });
      load();
    } catch { toast.error('Failed to update'); }
  };

  const filtered = users.filter(u => {
    const matchText = u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchDept = !deptFilter || u.department === deptFilter;
    return matchText && matchRole && matchDept;
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

      <div className="grid grid-cols-2 lg:grid-cols-5 border-b border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-700' },
          { label: 'Admins', value: stats.admins, color: 'text-violet-600' },
          { label: 'Managers', value: stats.managers, color: 'text-brand-600' },
          { label: 'Workers', value: stats.workers, color: 'text-emerald-600' },
          { label: 'Active', value: stats.active, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="px-4 sm:px-6 py-4 border-r border-slate-100 dark:border-slate-700/50 last:border-r-0 text-center">
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-8">
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5">
            ✓ {successMsg}
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input className="input w-60" placeholder="Search by name or email..." value={filter} onChange={e => setFilter(e.target.value)} />
          <select className="select w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="select w-40" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{departmentConfig[d]?.icon} {departmentConfig[d]?.label}</option>)}
          </select>
          <div className="ml-auto text-sm text-slate-400 font-medium">{filtered.length} users</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50">
                  {['User', 'Email', 'Role', 'Department', 'Employee ID', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                  {filtered.map(u => (
                    <motion.tr key={u.id} variants={item} className={`table-row ${!u.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center text-lg border border-white shadow-sm">
                            {u.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-700">{u.name}</div>
                            {u.id === user?.id && <span className="text-xs text-brand-600 font-semibold">(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize font-semibold ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.department && departmentConfig[u.department] ? (
                          <span className={`badge text-xs ${departmentConfig[u.department].color}`}>
                            {departmentConfig[u.department].icon} {departmentConfig[u.department].label}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-xs">{u.employee_id || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => u.id !== user?.id && handleToggleActive(u)}
                          disabled={u.id === user?.id}
                          className={`badge cursor-pointer transition-all font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'} ${u.id === user?.id ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'}`}
                        >
                          {u.is_active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 text-xs transition-all font-medium">
                            Edit
                          </button>
                          {u.id !== user?.id && (
                            <button onClick={() => setDeactivateId(u.id)} className="text-rose-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 text-xs transition-all font-medium">
                              Del
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Create User'} size="lg">
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Full Name" required>
              <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
          </div>
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
          <FormField label="Department">
            <select className="select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">— Select Department —</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{departmentConfig[d]?.icon} {departmentConfig[d]?.label}</option>)}
            </select>
          </FormField>
          <FormField label="Phone">
            <input className="input" placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </FormField>
          <FormField label="Employee ID">
            <input className="input" placeholder="CT-001" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} />
          </FormField>
          <FormField label="Location">
            <input className="input" placeholder="Dhaka, Bangladesh" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Avatar">
              <div className="flex gap-2 flex-wrap mt-1">
                {AVATARS.map(a => (
                  <button key={a} type="button"
                    onClick={() => setForm(f => ({ ...f, avatar: a }))}
                    className={`w-10 h-10 rounded-xl text-xl transition-all ${form.avatar === a ? 'bg-brand-100 border-2 border-brand-500 shadow-glow-blue' : 'bg-slate-100 border-2 border-transparent hover:border-slate-200'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
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
