export const formatCurrency = (amount, compact = false) => {
  if (amount == null) return '৳0';
  const num = parseFloat(amount);
  if (compact && num >= 10000000) return `৳${(num / 10000000).toFixed(1)} Cr`;
  if (compact && num >= 100000) return `৳${(num / 100000).toFixed(1)} L`;
  if (compact && num >= 1000) return `৳${(num / 1000).toFixed(0)}K`;
  return `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(num)}`;
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatRelative = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const statusConfig = {
  planning:    { label: 'Planning',    color: 'bg-blue-900/30 text-blue-400 border border-blue-800/40', dot: 'bg-blue-400' },
  active:      { label: 'Active',      color: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40', dot: 'bg-emerald-400' },
  completed:   { label: 'Completed',   color: 'bg-slate-700/50 text-slate-400 border border-slate-600/50', dot: 'bg-slate-400' },
  on_hold:     { label: 'On Hold',     color: 'bg-amber-900/30 text-amber-400 border border-amber-800/40', dot: 'bg-amber-400' },
  pending:     { label: 'Pending',     color: 'bg-slate-700/50 text-slate-400 border border-slate-600/50', dot: 'bg-slate-500' },
  in_progress: { label: 'In Progress', color: 'bg-purple-900/30 text-purple-400 border border-purple-800/40', dot: 'bg-purple-400' },
  blocked:     { label: 'Blocked',     color: 'bg-rose-900/30 text-rose-400 border border-rose-800/40', dot: 'bg-rose-400' },
};

export const priorityConfig = {
  low:      { label: 'Low',      color: 'bg-slate-700/50 text-slate-400 border border-slate-600/50' },
  medium:   { label: 'Medium',   color: 'bg-amber-900/30 text-amber-400 border border-amber-800/40' },
  high:     { label: 'High',     color: 'bg-orange-900/30 text-orange-400 border border-orange-800/40' },
  critical: { label: 'Critical', color: 'bg-rose-900/30 text-rose-400 border border-rose-800/40' },
};

export const categoryConfig = {
  labor:     { label: 'Labor',     color: '#E1306C', icon: '👷', bg: 'bg-pink-50' },
  materials: { label: 'Materials', color: '#833AB4', icon: '🧱', bg: 'bg-purple-50' },
  equipment: { label: 'Equipment', color: '#F77737', icon: '🏗️', bg: 'bg-orange-50' },
  overhead:  { label: 'Overhead',  color: '#10b981', icon: '📋', bg: 'bg-emerald-50' },
  other:     { label: 'Other',     color: '#64748b', icon: '📦', bg: 'bg-slate-50' },
};

export const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-emerald-500';
  if (progress >= 50) return 'bg-gradient-to-r from-instagram-purple to-brand-500';
  if (progress >= 25) return 'bg-amber-500';
  return 'bg-rose-500';
};

export const getProgressGradient = (progress) => {
  if (progress >= 80) return 'from-emerald-400 to-emerald-600';
  if (progress >= 50) return 'from-instagram-purple via-brand-500 to-instagram-orange';
  if (progress >= 25) return 'from-amber-400 to-amber-600';
  return 'from-rose-400 to-rose-600';
};

export const departmentConfig = {
  engineering:  { label: 'Engineering',  color: 'bg-purple-900/30 text-purple-400 border border-purple-800/40', icon: '🔧' },
  procurement:  { label: 'Procurement',  color: 'bg-pink-900/30 text-pink-400 border border-pink-800/40', icon: '📦' },
  site_ops:     { label: 'Site Ops',     color: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40', icon: '🏗️' },
  finance:      { label: 'Finance',      color: 'bg-orange-900/30 text-orange-400 border border-orange-800/40', icon: '💰' },
  hr:           { label: 'HR',           color: 'bg-rose-900/30 text-rose-400 border border-rose-800/40', icon: '👥' },
  safety:       { label: 'Safety',       color: 'bg-amber-900/30 text-amber-400 border border-amber-800/40', icon: '🛡️' },
  design:       { label: 'Design',       color: 'bg-violet-900/30 text-violet-400 border border-violet-800/40', icon: '📐' },
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
