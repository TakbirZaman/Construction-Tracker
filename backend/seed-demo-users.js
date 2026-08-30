// Populate database with demo users
// Run: node seed-demo-users.js

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const DEMO_USERS = [
  { name: 'Takbir', email: 'takbir@constructtrack.com', role: 'admin', avatar: '👑' },
  { name: 'Sakib', email: 'sakib@constructtrack.com', role: 'admin', avatar: '👨‍💻' },
  { name: 'Opi', email: 'opi@constructtrack.com', role: 'manager', avatar: '👨‍💼' },
  { name: 'Alamain', email: 'alamain@constructtrack.com', role: 'manager', avatar: '👩‍💼' },
  { name: 'Kawshik', email: 'kawshik@constructtrack.com', role: 'worker', avatar: '👷' },
];

async function seedDemoUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await pool.query('SELECT 1');
    console.log('✅ Connected');

    console.log('🔄 Clearing existing users...');
    await pool.query('DELETE FROM budget_entries');
    await pool.query('DELETE FROM materials');
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM projects');
    await pool.query('DELETE FROM users');

    console.log('🔄 Seeding demo users with password: admin123');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    for (const user of DEMO_USERS) {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password, role, avatar, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, avatar`,
        [user.name, user.email, hashedPassword, user.role, user.avatar, true]
      );
      console.log(`  ✅ Created: ${rows[0].name} (${rows[0].email}) - ${rows[0].role}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Accounts:');
    DEMO_USERS.forEach(u => {
      console.log(`  📧 ${u.email} (${u.role}) - password: admin123`);
    });
  } catch (e) {
    console.error('❌ Seeding failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDemoUsers();
