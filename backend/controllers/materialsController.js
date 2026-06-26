import { pool } from '../db/index.js';

export const getMaterialsByProject = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT *,
        (quantity_ordered - quantity_used) as quantity_remaining,
        CASE WHEN quantity_ordered > 0
          THEN ROUND((quantity_used / quantity_ordered) * 100, 1)
          ELSE 0
        END as usage_percentage,
        (quantity_ordered * unit_cost) as total_cost,
        CASE
          WHEN quantity_used > quantity_ordered THEN 'over_usage'
          WHEN quantity_ordered > 0 AND ((quantity_ordered - quantity_used) / quantity_ordered) < 0.10 THEN 'low_stock'
          ELSE 'ok'
        END as stock_status
      FROM materials
      WHERE project_id = $1
      ORDER BY created_at DESC
    `, [req.params.projectId]);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getMaterialById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT *,
        (quantity_ordered - quantity_used) as quantity_remaining,
        CASE WHEN quantity_ordered > 0
          THEN ROUND((quantity_used / quantity_ordered) * 100, 1)
          ELSE 0
        END as usage_percentage,
        (quantity_ordered * unit_cost) as total_cost
       FROM materials WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Material not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const createMaterial = async (req, res, next) => {
  try {
    const { name, unit = 'units', quantity_ordered = 0, quantity_used = 0, unit_cost = 0, supplier, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Material name is required' });

    const { rows } = await pool.query(
      `INSERT INTO materials (project_id, name, unit, quantity_ordered, quantity_used, unit_cost, supplier, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.params.projectId, name, unit, quantity_ordered, quantity_used, unit_cost, supplier, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const { name, unit, quantity_ordered, quantity_used, unit_cost, supplier, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE materials SET
        name = COALESCE($1, name),
        unit = COALESCE($2, unit),
        quantity_ordered = COALESCE($3, quantity_ordered),
        quantity_used = COALESCE($4, quantity_used),
        unit_cost = COALESCE($5, unit_cost),
        supplier = COALESCE($6, supplier),
        notes = COALESCE($7, notes),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, unit, quantity_ordered, quantity_used, unit_cost, supplier, notes, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Material not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM materials WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (err) { next(err); }
};

export const getMaterialSummary = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) as total_materials,
        COALESCE(SUM(quantity_ordered * unit_cost), 0) as total_material_value,
        COUNT(CASE WHEN quantity_used > quantity_ordered THEN 1 END) as over_usage_count,
        COUNT(CASE WHEN quantity_ordered > 0 AND ((quantity_ordered - quantity_used) / quantity_ordered) < 0.10 AND quantity_used <= quantity_ordered THEN 1 END) as low_stock_count
      FROM materials WHERE project_id = $1
    `, [req.params.projectId]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};
