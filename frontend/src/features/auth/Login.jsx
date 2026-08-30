import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../api/index.js';

const DEMO_ACCOUNTS = [
  { email: 'takbir@constructtrack.com',   role: 'Admin',   name: 'Takbir',   avatar: '👨‍💻', password: 'admin123', color: 'from-instagram-purple to-purple-700' },
  { email: 'sakib@constructtrack.com',    role: 'Admin',   name: 'Sakib',    avatar: '👨‍💻', password: 'admin123', color: 'from-brand-500 to-brand-700' },
  { email: 'opi@constructtrack.com',      role: 'Manager', name: 'Opi',      avatar: '👨‍💼', password: 'manager123', color: 'from-emerald-500 to-emerald-700' },
  { email: 'tanvir@constructtrack.com',   role: 'Manager', name: 'Tanvir',   avatar: '👨‍💼', password: 'manager123', color: 'from-rose-500 to-rose-700' },
  { email: 'kawshik@constructtrack.com',  role: 'Worker',  name: 'Kawshik',  avatar: '👷', password: 'worker123', color: 'from-amber-500 to-orange-600' },
  { email: 'arif@constructtrack.com',     role: 'Worker',  name: 'Arif',     avatar: '👷', password: 'worker123', color: 'from-pink-500 to-pink-700' },
];

const AVATARS = ['👑', '👩‍💼', '🧑‍💼', '👷', '👩‍🔧', '🔧', '🧱', '🏗️', '⚙️', '📐'];

export default function Login() {
  const [tab, setTab] = useState('login');
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
      {/* Floating background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-instagram-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-instagram-orange/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 bg-instagram-gradient rounded-2xl flex items-center justify-center shadow-glow-brand">
              <span className="text-white font-bold text-xl font-display">CT</span>
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-xl tracking-wide text-slate-800 uppercase">ConstructTrack</div>
              <div className="text-xs text-slate-400 font-mono tracking-wider">ENTERPRISE PRO ERP</div>
            </div>
          </motion.div>
          <p className="text-slate-500 text-sm">Construction & Real Estate Management Platform</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${tab === 'login' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${tab === 'register' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Register
          </button>
        </div>

        {tab === 'login'
          ? <LoginForm login={login} navigate={navigate} />
          : <RegisterForm setTab={setTab} />
        }
      </motion.div>
    </div>
  );
}

function LoginForm({ login, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your email and password.');
    } finally { setLoading(false); }
  };

  const quickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-6">Welcome Back</h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-5"
        >
          ⚠ {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Email Address</label>
          <input
            type="email" className="input" placeholder="you@company.com"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="input pr-12"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm px-1"
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="btn-primary justify-center py-3 mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
            : 'Sign In →'}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="text-xs text-slate-400 text-center mb-4 uppercase tracking-widest font-semibold">Quick Demo Login</div>
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <motion.button
              key={acc.email}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => quickLogin(acc)}
              className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm transition-all text-left group border border-slate-100 hover:border-slate-200"
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${acc.color} rounded-lg flex items-center justify-center text-base shadow-sm`}>
                {acc.avatar}
              </div>
              <div className="flex-1">
                <div className="text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">{acc.name} <span className="text-xs text-slate-400 font-normal">({acc.role})</span></div>
                <div className="text-xs text-slate-400">{acc.email}</div>
              </div>
              <span className="text-xs text-slate-300 group-hover:text-brand-500 transition-colors font-medium">Fill →</span>
            </motion.button>
          ))}
          <p className="text-xs text-slate-400 text-center mt-2">
            Password: <code className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">admin123</code>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function RegisterForm({ setTab }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'worker', avatar: '👷' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('All fields are required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      await authAPI.register(form);
      toast.success('Account created! You can now sign in.');
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => setTab('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email may already be in use.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-6">Create Account</h2>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-4">
          ⚠ {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4">
          ✓ {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder="John Smith" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input type="email" className="input" placeholder="you@company.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="input pr-12"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm px-1"
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Role</label>
          <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="worker">👷 Worker</option>
            <option value="manager">👩‍💼 Manager</option>
          </select>
          <p className="text-xs text-slate-400 mt-1.5">Admin accounts can only be created by existing admins.</p>
        </div>
        <div>
          <label className="label">Choose Avatar</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {AVATARS.map(a => (
              <motion.button key={a} type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setForm(f => ({ ...f, avatar: a }))}
                className={`w-10 h-10 rounded-xl text-lg transition-all ${form.avatar === a ? 'bg-brand-100 border-2 border-brand-500 shadow-glow-blue' : 'bg-slate-100 border-2 border-transparent hover:border-slate-200'}`}
              >
                {a}
              </motion.button>
            ))}
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="btn-primary justify-center py-3 mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
            : 'Create Account →'}
        </button>
      </form>

      <p className="text-xs text-slate-400 text-center mt-5">
        Already have an account?{' '}
        <button onClick={() => setTab('login')} className="text-brand-600 hover:text-brand-700 font-semibold">Sign in</button>
      </p>
    </motion.div>
  );
}
