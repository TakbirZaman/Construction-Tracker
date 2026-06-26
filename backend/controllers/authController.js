import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()]
    );

    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) { next(err); }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'worker', avatar = '👷' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // ── Check for duplicate email ──────────────────────────────────────────
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'This email is already registered. Please use a different email or sign in.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, avatar, is_active, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashed, role, avatar]
    );

    const token = generateToken(rows[0].id);
    res.status(201).json({ token, user: rows[0] });
  } catch (err) {
    // Also catch PostgreSQL unique constraint violation (code 23505)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This email is already registered. Please use a different email or sign in.' });
    }
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Current and new password are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);

    if (!(await bcrypt.compare(currentPassword, rows[0].password))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
};
