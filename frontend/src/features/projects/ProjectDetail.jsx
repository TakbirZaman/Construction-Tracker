import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
        breadcrumb={<><Link to="/projects" className="hover:text-slate-300">Projects</Link> <span>›</span> <span className="text-slate-300">{project.name}</span></>}
        actions={<StatusBadge status={project.status} />}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-800">
        {[
          { label: 'Progress', value: `${Math.round(project.progress || 0)}%`, sub: `${project.completed_tasks}/${project.total_tasks} tasks`, color: 'text-brand-400' },
          { label: 'Budget', value: formatCurrency(project.budget, true), sub: 'Total allocated', color: 'text-blue-400' },
          { label: 'Spent', value: formatCurrency(project.total_actual_cost, true), sub: isOverBudget ? '⚠ Over budget' : 'Of budget used', color: isOverBudget ? 'text-red-400' : 'text-green-400' },
          { label: 'Timeline', value: formatDate(project.end_date), sub: `Started ${formatDate(project.start_date)}`, color: 'text-slate-300' },
        ].map(s => (
          <div key={s.label} className="px-6 py-4 border-r border-slate-800 last:border-r-0">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar strip */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/30">
        <ProgressBar value={project.progress} height="h-1.5" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/30 px-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === t.id
                ? 'text-brand-400 border-brand-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-8">
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
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{project.description}</p>
          </div>
        )}

        <div className="card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Budget Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Budget</span>
              <span className="font-mono text-slate-200">{formatCurrency(budget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Actual Spent</span>
              <span className={`font-mono font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(budgetUsed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Variance</span>
              <span className={`font-mono font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(budget - budgetUsed))}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Utilization</span>
                <span className={isOverBudget ? 'text-red-400' : ''}>{Math.round(budget > 0 ? (budgetUsed / budget) * 100 : 0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-brand-500'}`}
                  style={{ width: `${Math.min(100, budget > 0 ? (budgetUsed / budget) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Project Details</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Manager', value: project.manager_name ? `${project.manager_avatar || ''} ${project.manager_name}` : 'Unassigned' },
              { label: 'Status', value: <StatusBadge status={project.status} /> },
              { label: 'Start Date', value: formatDate(project.start_date) },
              { label: 'End Date', value: formatDate(project.end_date) },
              { label: 'Location', value: project.location || '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-slate-500">{item.label}</span>
                <span className="text-slate-300 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Task Summary</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Total', value: project.total_tasks, color: 'text-slate-300' },
              { label: 'Completed', value: project.completed_tasks, color: 'text-green-400' },
              { label: 'In Progress', value: parseInt(project.total_tasks) - parseInt(project.completed_tasks), color: 'text-blue-400' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-slate-500">{item.label}</span>
                <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
