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
  planning:    { label: 'Planning',    color: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  active:      { label: 'Active',      color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  completed:   { label: 'Completed',   color: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
  on_hold:     { label: 'On Hold',     color: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  pending:     { label: 'Pending',     color: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500' },
  blocked:     { label: 'Blocked',     color: 'bg-rose-50 text-rose-700 border border-rose-200', dot: 'bg-rose-500' },
};

export const priorityConfig = {
  low:      { label: 'Low',      color: 'bg-slate-50 text-slate-600 border border-slate-200' },
  medium:   { label: 'Medium',   color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  high:     { label: 'High',     color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  critical: { label: 'Critical', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
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
  engineering:  { label: 'Engineering',  color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: '🔧' },
  procurement:  { label: 'Procurement',  color: 'bg-pink-50 text-pink-700 border border-pink-200', icon: '📦' },
  site_ops:     { label: 'Site Ops',     color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: '🏗️' },
  finance:      { label: 'Finance',      color: 'bg-orange-50 text-orange-700 border border-orange-200', icon: '💰' },
  hr:           { label: 'HR',           color: 'bg-rose-50 text-rose-700 border border-rose-200', icon: '👥' },
  safety:       { label: 'Safety',       color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '🛡️' },
  design:       { label: 'Design',       color: 'bg-violet-50 text-violet-700 border border-violet-200', icon: '📐' },
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
