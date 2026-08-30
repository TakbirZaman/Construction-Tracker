import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { StatCard, StatusBadge, PriorityBadge, ProgressBar, Spinner } from '../../components/ui/index.jsx';
import { formatCurrency, formatRelative, categoryConfig } from '../../utils/helpers.js';

const STATUS_COLORS = { planning: '#833AB4', active: '#10b981', completed: '#94a3b8', on_hold: '#F77737' };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  const projectStatusData = data ? [
    { name: 'Active', value: parseInt(data.projects.active), color: '#10b981' },
    { name: 'Planning', value: parseInt(data.projects.planning), color: '#833AB4' },
    { name: 'Completed', value: parseInt(data.projects.completed), color: '#94a3b8' },
    { name: 'On Hold', value: parseInt(data.projects.on_hold), color: '#F77737' },
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

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Top Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={item}>
            <StatCard icon="🏗️" label="Total Projects" value={data?.projects.total || 0} color="text-instagram-purple"
              sub={`${data?.projects.active || 0} active`} gradient="gradient-purple" />
          </motion.div>
          <motion.div variants={item}>
            <StatCard icon="✅" label="Total Tasks" value={data?.tasks.total || 0} color="text-emerald-600"
              sub={`${data?.tasks.completed || 0} completed`} gradient="gradient-emerald" />
          </motion.div>
          <motion.div variants={item}>
            <StatCard icon="💰" label="Total Budget" value={formatCurrency(data?.projects.total_budget, true)} color="text-instagram-orange"
              sub={`${formatCurrency(data?.budget.total_actual, true)} spent`} gradient="gradient-orange" />
          </motion.div>
          <motion.div variants={item}>
            <StatCard icon="📈" label="Budget Variance" value={formatCurrency(Math.abs(data?.budget.variance || 0), true)}
              color={parseFloat(data?.budget.variance) >= 0 ? 'text-emerald-600' : 'text-rose-600'}
              sub={parseFloat(data?.budget.variance) >= 0 ? 'Under budget' : 'Over budget'} gradient={parseFloat(data?.budget.variance) >= 0 ? 'gradient-emerald' : 'gradient-pink'} />
          </motion.div>
        </motion.div>

        {/* Task Status Row */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: data?.tasks.pending || 0, color: 'text-slate-400', bg: 'bg-slate-800/60 border border-slate-700/50', icon: '⏳' },
            { label: 'In Progress', value: data?.tasks.in_progress || 0, color: 'text-instagram-purple', bg: 'bg-purple-900/30 border border-purple-800/40', icon: '🔄' },
            { label: 'Completed', value: data?.tasks.completed || 0, color: 'text-emerald-400', bg: 'bg-emerald-900/30 border border-emerald-800/40', icon: '✅' },
            { label: 'Blocked', value: data?.tasks.blocked || 0, color: 'text-rose-400', bg: 'bg-rose-900/30 border border-rose-800/40', icon: '🚫' },
          ].map(s => (
            <motion.div key={s.label} variants={item} className={`p-4 rounded-xl flex items-center gap-4 ${s.bg} hover:shadow-md transition-all duration-300`}>
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 card p-6"
          >
            <h3 className="text-sm font-bold text-slate-300 mb-1 uppercase tracking-wider">Budget vs Actual (000s)</h3>
            <p className="text-xs text-slate-500 mb-6">Cost breakdown by category</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}K`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12, color: '#e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                  formatter={(v, name) => [`৳${(v * 1000).toLocaleString()}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="Planned" fill="#c4b5fd" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#E1306C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Project Status Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-slate-300 mb-1 uppercase tracking-wider">Project Status</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution overview</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {projectStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12, color: '#e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 mt-2">
              {projectStatusData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-400 font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Project Progress</h3>
              <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">View all →</Link>
            </div>
            <div className="flex flex-col gap-4">
              {data?.projectProgress?.map(p => (
                <div key={p.id} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <Link to={`/projects/${p.id}`} className="text-sm text-slate-300 hover:text-brand-400 font-semibold truncate max-w-[200px]">{p.name}</Link>
                    <StatusBadge status={p.status} />
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5">Recent Activity</h3>
            <div className="flex flex-col gap-3">
              {data?.recentTasks?.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-700/40 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-500/20 to-instagram-orange/15 rounded-full flex items-center justify-center text-sm flex-shrink-0 border border-slate-700 shadow-sm">
                    {task.assignee_avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 font-semibold truncate">{task.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{task.project_name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-slate-400">{formatRelative(task.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
