import { pool } from '../db/index.js';

export const getTasksByProject = async (req, res, next) => {
  try {
    let query = `
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
    `;
    const params = [req.params.projectId];

    if (req.user.role === 'worker') {
      query += ` AND t.assigned_to = $2`;
      params.push(req.user.id);
    }

    if (req.query.status) {
      query += ` AND t.status = $${params.length + 1}`;
      params.push(req.query.status);
    }

    query += ' ORDER BY t.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
       FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const createTask = async (req, res, next) => {
  try {
    const { project_id, title, description, status = 'pending', priority = 'medium', assigned_to, due_date, notes } = req.body;

    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const pid = req.params.projectId || project_id;

    // Auto-set progress based on status
    const progress = status === 'completed' ? 100 : status === 'pending' ? 0 : 0;

    const { rows } = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, progress, assigned_to, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [pid, title, description, status, priority, progress, assigned_to || null, due_date || null, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

export const updateTask = async (req, res, next) => {
  try {
    let { title, description, status, priority, progress, assigned_to, due_date, notes } = req.body;

    // Workers can only update status, progress, notes
    if (req.user.role === 'worker') {
      const { rows: existing } = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND assigned_to = $2',
        [req.params.id, req.user.id]
      );
      if (!existing[0]) return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Auto-rules
    if (status === 'completed') progress = 100;
    if (status === 'pending') progress = 0;

    const { rows } = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        progress = COALESCE($5, progress),
        assigned_to = COALESCE($6, assigned_to),
        due_date = COALESCE($7, due_date),
        notes = COALESCE($8, notes),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [title, description, status, priority, progress, assigned_to || null, due_date || null, notes, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) { next(err); }
};

export const getMyTasks = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, p.name as project_name, u.name as assignee_name, u.avatar as assignee_avatar
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.assigned_to = $1
       ORDER BY
         CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         t.due_date ASC NULLS LAST`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};
