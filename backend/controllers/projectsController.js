import { pool } from '../db/index.js';

export const getAllProjects = async (req, res, next) => {
  try {
    let query = `
      SELECT
        p.*,
        u.name as manager_name,
        u.avatar as manager_avatar,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
        COALESCE(SUM(be.actual_cost), 0) as total_actual_cost,
        COALESCE(SUM(be.planned_cost), 0) as total_planned_cost,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100, 1)
        END as progress
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN budget_entries be ON p.id = be.project_id
    `;

    const params = [];
    const conditions = [];

    if (req.user.role === 'worker') {
      conditions.push(`p.id IN (SELECT DISTINCT project_id FROM tasks WHERE assigned_to = $${params.length + 1})`);
      params.push(req.user.id);
    } else if (req.user.role === 'manager') {
      conditions.push(`(p.manager_id = $${params.length + 1} OR p.created_by = $${params.length + 2})`);
      params.push(req.user.id, req.user.id);
    }

    if (req.query.status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(req.query.status);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY p.id, u.name, u.avatar ORDER BY p.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.*,
        u.name as manager_name,
        u.avatar as manager_avatar,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
        COALESCE(SUM(DISTINCT be.actual_cost), 0) as total_actual_cost,
        COALESCE(SUM(DISTINCT be.planned_cost), 0) as total_planned_cost,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100, 1)
        END as progress
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN budget_entries be ON p.id = be.project_id
      WHERE p.id = $1
      GROUP BY p.id, u.name, u.avatar
    `, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, status = 'planning', budget = 0, start_date, end_date, location, manager_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const { rows } = await pool.query(
      `INSERT INTO projects (name, description, status, budget, start_date, end_date, location, manager_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, description, status, budget, start_date || null, end_date || null, location, manager_id || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, budget, start_date, end_date, location, manager_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        budget = COALESCE($4, budget),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        location = COALESCE($7, location),
        manager_id = COALESCE($8, manager_id),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [name, description, status, budget, start_date || null, end_date || null, location, manager_id || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) { next(err); }
};

export const getProjectStats = async (req, res, next) => {
  try {
    const { rows: stats } = await pool.query(`
      SELECT
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(AVG(CASE
          WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id) > 0
          THEN (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id AND status = 'completed')::numeric /
               (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id)::numeric * 100
          ELSE 0
        END), 0) as avg_progress
      FROM projects
    `);

    const { rows: budgetByCategory } = await pool.query(`
      SELECT
        category,
        SUM(planned_cost) as planned,
        SUM(actual_cost) as actual
      FROM budget_entries
      GROUP BY category
      ORDER BY planned DESC
    `);

    const { rows: projectBudgets } = await pool.query(`
      SELECT
        p.name,
        p.budget,
        COALESCE(SUM(be.actual_cost), 0) as actual_cost
      FROM projects p
      LEFT JOIN budget_entries be ON p.id = be.project_id
      GROUP BY p.id, p.name, p.budget
      ORDER BY p.budget DESC
      LIMIT 5
    `);

    res.json({ ...stats[0], budgetByCategory, projectBudgets });
  } catch (err) { next(err); }
};
