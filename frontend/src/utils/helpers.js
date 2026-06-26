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
  planning: { label: 'Planning', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  active: { label: 'Active', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  completed: { label: 'Completed', color: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
  on_hold: { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  pending: { label: 'Pending', color: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  blocked: { label: 'Blocked', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

export const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400' },
};

export const categoryConfig = {
  labor: { label: 'Labor', color: '#f97316', icon: '👷' },
  materials: { label: 'Materials', color: '#3b82f6', icon: '🧱' },
  equipment: { label: 'Equipment', color: '#8b5cf6', icon: '🏗️' },
  overhead: { label: 'Overhead', color: '#10b981', icon: '📋' },
  other: { label: 'Other', color: '#6b7280', icon: '📦' },
};

export const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-brand-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
