import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../api/index.js';

const DEMO_ACCOUNTS = [
  { email: 'admin@constructtrack.com',   role: 'Admin',   name: 'System Admin',       avatar: '👑', password: 'password123' },
  { email: 'rafiqul@constructtrack.com', role: 'Manager', name: 'Md. Rafiqul Islam',  avatar: '👨‍💼', password: 'password123' },
  { email: 'nasrin@constructtrack.com',  role: 'Manager', name: 'Nasrin Akter',       avatar: '👩‍💼', password: 'password123' },
  { email: 'kamal@constructtrack.com',   role: 'Worker',  name: 'Md. Kamal Hossain', avatar: '👷', password: 'password123' },
  { email: 'fatema@constructtrack.com',  role: 'Worker',  name: 'Fatema Begum',       avatar: '👩‍🔧', password: 'password123' },
];

const AVATARS = ['👑', '👩‍💼', '🧑‍💼', '👷', '👩‍🔧', '🔧', '🧱', '🏗️', '⚙️', '📐'];

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <img src="https://www.nnsel.com/assets/nnsel-B5wYGJs_.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
            <div className="text-left">
              <div className="font-display font-bold text-xl tracking-widest text-white uppercase">Construction Tracker</div>
              <div className="text-xs text-slate-500 font-mono tracking-wider">ENTERPRISE PRO ERP</div>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Construction & Real Estate Management Platform</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-4">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'login' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'register' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Register
          </button>
        </div>

        {tab === 'login'
          ? <LoginForm login={login} navigate={navigate} />
          : <RegisterForm setTab={setTab} />
        }
      </div>
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
    <div className="card p-8">
      <h2 className="text-xl font-display font-bold text-white mb-6">Welcome Back</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
          ⚠ {error}
        </div>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors text-sm px-1"
            >
              {showPass ? '🙈 Hide' : '👁 Show'}
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
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Quick Demo Login</div>
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              onClick={() => quickLogin(acc)}
              className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm transition-colors text-left group"
            >
              <span className="text-lg">{acc.avatar}</span>
              <div>
                <div className="text-slate-300 font-medium group-hover:text-white transition-colors">{acc.name} <span className="text-xs text-slate-500">({acc.role})</span></div>
                <div className="text-xs text-slate-500">{acc.email}</div>
              </div>
              <span className="ml-auto text-xs text-slate-600 group-hover:text-brand-400 transition-colors">Fill →</span>
            </button>
          ))}
          <p className="text-xs text-slate-600 text-center mt-1">
            Password: <code className="font-mono text-slate-400 bg-slate-800 px-1 py-0.5 rounded">password123</code>
          </p>
        </div>
      </div>
    </div>
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
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => setTab('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email may already be in use.');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-8">
      <h2 className="text-xl font-display font-bold text-white mb-6">Create Account</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          ⚠ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
          ✓ {success}
        </div>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors text-sm px-1"
            >
              {showPass ? '🙈 Hide' : '👁 Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Role</label>
          <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="worker">👷 Worker</option>
            <option value="manager">👩‍💼 Manager</option>
          </select>
          <p className="text-xs text-slate-600 mt-1">Admin accounts can only be created by existing admins.</p>
        </div>
        <div>
          <label className="label">Choose Avatar</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {AVATARS.map(a => (
              <button key={a} type="button"
                onClick={() => setForm(f => ({ ...f, avatar: a }))}
                className={`w-9 h-9 rounded-lg text-lg transition-all ${form.avatar === a ? 'bg-brand-500/30 border-2 border-brand-500' : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'}`}
              >
                {a}
              </button>
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

      <p className="text-xs text-slate-500 text-center mt-4">
        Already have an account?{' '}
        <button onClick={() => setTab('login')} className="text-brand-400 hover:text-brand-300">Sign in</button>
      </p>
    </div>
  );
}
