import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsAPI } from '../../api/index.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { StatusBadge, ProgressBar, Spinner } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate } from '../../utils/helpers.js';
import TasksTab from '../tasks/TasksTab.jsx';
import MaterialsTab from '../materials/MaterialsTab.jsx';
import BudgetTab from '../budget/BudgetTab.jsx';

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'tasks', label: '✅ Tasks' },
  { id: 'materials', label: '📦 Materials' },
  { id: 'budget', label: '💰 Budget' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const load = () => {
    projectsAPI.getById(id)
      .then(({ data }) => setProject(data))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!project) return null;

  const budgetUsed = parseFloat(project.total_actual_cost || 0);
  const budget = parseFloat(project.budget || 0);
  const budgetPct = budget > 0 ? Math.min(100, (budgetUsed / budget) * 100) : 0;
  const isOverBudget = budgetUsed > budget;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={project.name}
        subtitle={project.location ? `📍 ${project.location}` : undefined}
        breadcrumb={<><Link to="/projects" className="hover:text-brand-600 transition-colors">Projects</Link> <span className="text-slate-300">›</span> <span className="text-slate-700 font-medium">{project.name}</span></>}
        actions={<StatusBadge status={project.status} />}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
        {[
          { label: 'Progress', value: `${Math.round(project.progress || 0)}%`, sub: `${project.completed_tasks}/${project.total_tasks} tasks`, color: 'text-brand-600' },
          { label: 'Budget', value: formatCurrency(project.budget, true), sub: 'Total allocated', color: 'text-violet-600' },
          { label: 'Spent', value: formatCurrency(project.total_actual_cost, true), sub: isOverBudget ? '⚠ Over budget' : 'Of budget used', color: isOverBudget ? 'text-rose-600' : 'text-emerald-600' },
          { label: 'Timeline', value: formatDate(project.end_date), sub: `Started ${formatDate(project.start_date)}`, color: 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="px-4 sm:px-6 py-4 border-r border-slate-100 dark:border-slate-700/50 last:border-r-0">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">{s.label}</div>
            <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar strip */}
      <div className="px-6 py-3 border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
        <ProgressBar value={project.progress} height="h-1.5" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 px-4 sm:px-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === t.id
                ? 'text-brand-600 border-brand-500'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-8">
        {tab === 'overview' && <OverviewTab project={project} />}
        {tab === 'tasks' && <TasksTab projectId={id} onUpdate={load} />}
        {tab === 'materials' && <MaterialsTab projectId={id} />}
        {tab === 'budget' && <BudgetTab projectId={id} projectBudget={project.budget} />}
      </div>
    </div>
  );
}

function OverviewTab({ project }) {
  const budgetUsed = parseFloat(project.total_actual_cost || 0);
  const budget = parseFloat(project.budget || 0);
  const isOverBudget = budgetUsed > budget;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {project.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Budget Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Budget</span>
              <span className="font-mono font-bold text-slate-700">{formatCurrency(budget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Actual Spent</span>
              <span className={`font-mono font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(budgetUsed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Variance</span>
              <span className={`font-mono font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(budget - budgetUsed))}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Utilization</span>
                <span className={isOverBudget ? 'text-rose-500' : ''}>{Math.round(budget > 0 ? (budgetUsed / budget) * 100 : 0)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budget > 0 ? (budgetUsed / budget) * 100 : 0)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${isOverBudget ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Project Details</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Manager', value: project.manager_name ? `${project.manager_avatar || ''} ${project.manager_name}` : 'Unassigned' },
              { label: 'Status', value: <StatusBadge status={project.status} /> },
              { label: 'Start Date', value: formatDate(project.start_date) },
              { label: 'End Date', value: formatDate(project.end_date) },
              { label: 'Location', value: project.location || '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-700 font-medium text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Task Summary</h3>
          <div className="space-y-2.5 text-sm">
            {[
              { label: 'Total', value: project.total_tasks, color: 'text-slate-700' },
              { label: 'Completed', value: project.completed_tasks, color: 'text-emerald-600' },
              { label: 'In Progress', value: parseInt(project.total_tasks) - parseInt(project.completed_tasks), color: 'text-brand-600' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-slate-400">{item.label}</span>
                <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
