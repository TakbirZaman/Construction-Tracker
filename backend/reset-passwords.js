// Run this ONCE if you already seeded the DB with the old broken hash:
// node reset-passwords.js

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const hash = await bcrypt.hash('password123', 10);
await pool.query('UPDATE users SET password = $1', [hash]);
console.log('✅ All user passwords reset to: password123');
await pool.end();
