import bcrypt from 'bcryptjs';
import { queryWithRetry } from '../db/index.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await queryWithRetry(
      `SELECT id, name, email, role, avatar, is_active, created_at,
        phone, department, employee_id, location, bio,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id) as task_count,
        (SELECT COUNT(*) FROM projects WHERE manager_id = users.id) as project_count
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

export const getUserById = async (req, res, next) => {
  try {
    const { rows } = await queryWithRetry(
      `SELECT id, name, email, role, avatar, is_active, created_at, phone, department, employee_id, location, bio FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'worker', avatar = '👷', phone, department, employee_id, location, bio } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { rows: existing } = await queryWithRetry(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'This email is already registered. Please use a different email.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await queryWithRetry(
      `INSERT INTO users (name, email, password, role, avatar, phone, department, employee_id, location, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, role, avatar, is_active, created_at, phone, department, employee_id, location, bio`,
      [name.trim(), email.toLowerCase().trim(), hashed, role, avatar, phone || null, department || null, employee_id || null, location || null, bio || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This email is already registered. Please use a different email.' });
    }
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, avatar, is_active, phone, department, employee_id, location, bio } = req.body;

    if (email) {
      const { rows: existing } = await queryWithRetry(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), req.params.id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: 'This email is already used by another account.' });
      }
    }

    const { rows } = await queryWithRetry(
      `UPDATE users SET
        name       = COALESCE($1, name),
        email      = COALESCE($2, email),
        role       = COALESCE($3, role),
        avatar     = COALESCE($4, avatar),
        is_active  = COALESCE($5, is_active),
        phone      = COALESCE($6, phone),
        department = COALESCE($7, department),
        employee_id = COALESCE($8, employee_id),
        location   = COALESCE($9, location),
        bio        = COALESCE($10, bio),
        updated_at = NOW()
       WHERE id = $11
       RETURNING id, name, email, role, avatar, is_active, created_at, phone, department, employee_id, location, bio`,
      [name, email ? email.toLowerCase().trim() : null, role, avatar, is_active, phone || null, department || null, employee_id || null, location || null, bio || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This email is already used by another account.' });
    }
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: 'Cannot delete your own account' });

    const { rows } = await queryWithRetry(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deactivated successfully' });
  } catch (err) { next(err); }
};

export const getWorkers = async (req, res, next) => {
  try {
    const { rows } = await queryWithRetry(
      `SELECT id, name, email, role, avatar FROM users
       WHERE role IN ('worker','manager') AND is_active = true ORDER BY name`
    );
    res.json(rows);
  } catch (err) { next(err); }
};
