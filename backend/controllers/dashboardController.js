import { pool } from '../db/index.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';

    // Project stats
    let projectQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold,
        COALESCE(SUM(budget), 0) as total_budget
      FROM projects
    `;
    if (isManager) {
      projectQuery += ` WHERE manager_id = ${req.user.id} OR created_by = ${req.user.id}`;
    }

    const { rows: projects } = await pool.query(projectQuery);

    // Task stats
    let taskQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked
      FROM tasks
    `;
    if (req.user.role === 'worker') {
      taskQuery += ` WHERE assigned_to = ${req.user.id}`;
    }

    const { rows: tasks } = await pool.query(taskQuery);

    // Budget overview
    const { rows: budget } = await pool.query(`
      SELECT
        COALESCE(SUM(planned_cost), 0) as total_planned,
        COALESCE(SUM(actual_cost), 0) as total_actual,
        COALESCE(SUM(planned_cost) - SUM(actual_cost), 0) as variance
      FROM budget_entries
    `);

    // Recent activity (recent tasks updated)
    const { rows: recentTasks } = await pool.query(`
      SELECT t.id, t.title, t.status, t.priority, t.progress, t.updated_at,
        p.name as project_name, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.updated_at DESC
      LIMIT 5
    `);

    // Progress overview per project
    const { rows: projectProgress } = await pool.query(`
      SELECT
        p.id, p.name, p.status,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        CASE WHEN COUNT(t.id) > 0
          THEN ROUND((COUNT(CASE WHEN t.status='completed' THEN 1 END)::numeric/COUNT(t.id)::numeric)*100,1)
          ELSE 0
        END as progress,
        COALESCE(SUM(be.actual_cost), 0) as actual_cost,
        p.budget
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN budget_entries be ON p.id = be.project_id
      GROUP BY p.id, p.name, p.status, p.budget
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // Budget by category chart data
    const { rows: budgetByCategory } = await pool.query(`
      SELECT category, SUM(planned_cost) as planned, SUM(actual_cost) as actual
      FROM budget_entries GROUP BY category ORDER BY planned DESC
    `);

    res.json({
      projects: projects[0],
      tasks: tasks[0],
      budget: budget[0],
      recentTasks,
      projectProgress,
      budgetByCategory
    });
  } catch (err) { next(err); }
};
