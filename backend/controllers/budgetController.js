import { pool } from '../db/index.js';

export const getBudgetByProject = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM budget_entries WHERE project_id = $1 ORDER BY date DESC, created_at DESC`,
      [req.params.projectId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

export const getBudgetSummary = async (req, res, next) => {
  try {
    const { rows: project } = await pool.query(
      'SELECT budget FROM projects WHERE id = $1',
      [req.params.projectId]
    );
    if (!project[0]) return res.status(404).json({ error: 'Project not found' });

    const { rows: summary } = await pool.query(`
      SELECT
        SUM(planned_cost) as total_planned,
        SUM(actual_cost) as total_actual,
        SUM(planned_cost) - SUM(actual_cost) as variance,
        CASE WHEN SUM(planned_cost) > 0
          THEN ROUND((SUM(actual_cost) / SUM(planned_cost)) * 100, 1)
          ELSE 0
        END as utilization_percentage,
        CASE WHEN SUM(actual_cost) > SUM(planned_cost) THEN true ELSE false END as is_over_budget
      FROM budget_entries WHERE project_id = $1
    `, [req.params.projectId]);

    const { rows: byCategory } = await pool.query(`
      SELECT
        category,
        SUM(planned_cost) as planned,
        SUM(actual_cost) as actual,
        SUM(planned_cost) - SUM(actual_cost) as variance,
        COUNT(*) as entry_count
      FROM budget_entries WHERE project_id = $1
      GROUP BY category ORDER BY planned DESC
    `, [req.params.projectId]);

    res.json({
      project_budget: parseFloat(project[0].budget),
      ...summary[0],
      byCategory
    });
  } catch (err) { next(err); }
};

export const createBudgetEntry = async (req, res, next) => {
  try {
    const { category, description, planned_cost = 0, actual_cost = 0, date, notes } = req.body;
    if (!category || !description)
      return res.status(400).json({ error: 'Category and description are required' });

    const { rows } = await pool.query(
      `INSERT INTO budget_entries (project_id, category, description, planned_cost, actual_cost, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.projectId, category, description, planned_cost, actual_cost, date || null, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

export const updateBudgetEntry = async (req, res, next) => {
  try {
    const { category, description, planned_cost, actual_cost, date, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE budget_entries SET
        category = COALESCE($1, category),
        description = COALESCE($2, description),
        planned_cost = COALESCE($3, planned_cost),
        actual_cost = COALESCE($4, actual_cost),
        date = COALESCE($5, date),
        notes = COALESCE($6, notes),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [category, description, planned_cost, actual_cost, date || null, notes, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Budget entry not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const deleteBudgetEntry = async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM budget_entries WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Budget entry not found' });
    res.json({ message: 'Budget entry deleted successfully' });
  } catch (err) { next(err); }
};
