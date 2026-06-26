import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { StatCard, StatusBadge, PriorityBadge, ProgressBar, Spinner } from '../../components/ui/index.jsx';
import { formatCurrency, formatRelative, categoryConfig } from '../../utils/helpers.js';

const STATUS_COLORS = { planning: '#3b82f6', active: '#22c55e', completed: '#64748b', on_hold: '#eab308' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const projectStatusData = data ? [
    { name: 'Active', value: parseInt(data.projects.active), color: '#22c55e' },
    { name: 'Planning', value: parseInt(data.projects.planning), color: '#3b82f6' },
    { name: 'Completed', value: parseInt(data.projects.completed), color: '#64748b' },
    { name: 'On Hold', value: parseInt(data.projects.on_hold), color: '#eab308' },
  ].filter(d => d.value > 0) : [];

  const budgetChartData = data?.budgetByCategory?.map(b => ({
    name: categoryConfig[b.category]?.label || b.category,
    Planned: parseFloat(b.planned) / 1000,
    Actual: parseFloat(b.actual) / 1000,
    fill: categoryConfig[b.category]?.color,
  })) || [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} ${user?.avatar}`}
        subtitle={`Here's your project overview — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      <div className="p-8 space-y-8">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🏗️" label="Total Projects" value={data?.projects.total || 0} color="text-brand-400"
            sub={`${data?.projects.active || 0} active`} />
          <StatCard icon="✅" label="Total Tasks" value={data?.tasks.total || 0} color="text-green-400"
            sub={`${data?.tasks.completed || 0} completed`} />
          <StatCard icon="💰" label="Total Budget" value={formatCurrency(data?.projects.total_budget, true)} color="text-blue-400"
            sub={`${formatCurrency(data?.budget.total_actual, true)} spent`} />
          <StatCard icon="📈" label="Budget Variance" value={formatCurrency(Math.abs(data?.budget.variance || 0), true)}
            color={parseFloat(data?.budget.variance) >= 0 ? 'text-green-400' : 'text-red-400'}
            sub={parseFloat(data?.budget.variance) >= 0 ? 'Under budget' : 'Over budget'} />
        </div>

        {/* Task Status Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: data?.tasks.pending || 0, color: 'text-slate-400', bg: 'bg-slate-500/10', icon: '⏳' },
            { label: 'In Progress', value: data?.tasks.in_progress || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '🔄' },
            { label: 'Completed', value: data?.tasks.completed || 0, color: 'text-green-400', bg: 'bg-green-500/10', icon: '✅' },
            { label: 'Blocked', value: data?.tasks.blocked || 0, color: 'text-red-400', bg: 'bg-red-500/10', icon: '🚫' },
          ].map(s => (
            <div key={s.label} className={`card p-4 flex items-center gap-4 ${s.bg} border-0`}>
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Chart */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Budget vs Actual (000s)</h3>
            <p className="text-xs text-slate-500 mb-6">Cost breakdown by category</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}K`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v, name) => [`৳${(v * 1000).toLocaleString()}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Planned" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="Actual" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Pie */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Project Status</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution overview</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {projectStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-2">
              {projectStatusData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Progress */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Project Progress</h3>
              <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
            </div>
            <div className="flex flex-col gap-4">
              {data?.projectProgress?.map(p => (
                <div key={p.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <Link to={`/projects/${p.id}`} className="text-sm text-slate-300 hover:text-white font-medium truncate max-w-[200px]">{p.name}</Link>
                    <StatusBadge status={p.status} />
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Recent Activity</h3>
            <div className="flex flex-col gap-3">
              {data?.recentTasks?.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {task.assignee_avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-300 font-medium truncate">{task.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{task.project_name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-slate-600">{formatRelative(task.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
