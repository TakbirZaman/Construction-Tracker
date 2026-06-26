import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'worker' CHECK (role IN ('admin','manager','worker')),
        avatar VARCHAR(10) DEFAULT '👷',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','active','completed','on_hold')),
        budget NUMERIC(15,2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        location VARCHAR(255),
        manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked')),
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        due_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS materials (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'units',
        quantity_ordered NUMERIC(12,2) DEFAULT 0,
        quantity_used NUMERIC(12,2) DEFAULT 0,
        unit_cost NUMERIC(12,2) DEFAULT 0,
        supplier VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS budget_entries (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL CHECK (category IN ('labor','materials','equipment','overhead','other')),
        description VARCHAR(255) NOT NULL,
        planned_cost NUMERIC(12,2) DEFAULT 0,
        actual_cost NUMERIC(12,2) DEFAULT 0,
        date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database migrations completed');
    await seedData(client);
  } finally {
    client.release();
  }
}

async function seedData(client) {
  const { rows } = await client.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count) > 0) return;

  console.log('🌱 Seeding demo data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Bangladeshi names for managers and workers
  await client.query(`
    INSERT INTO users (name, email, password, role, avatar) VALUES
    ('System Admin',          'admin@constructtrack.com',   $1, 'admin',   '👑'),
    ('Md. Rafiqul Islam',     'rafiqul@constructtrack.com', $1, 'manager', '👨‍💼'),
    ('Nasrin Akter',          'nasrin@constructtrack.com',  $1, 'manager', '👩‍💼'),
    ('Md. Kamal Hossain',     'kamal@constructtrack.com',   $1, 'worker',  '👷'),
    ('Fatema Begum',          'fatema@constructtrack.com',  $1, 'worker',  '👩‍🔧'),
    ('Md. Shahidul Alam',     'shahidul@constructtrack.com',$1, 'worker',  '🔧'),
    ('Rezaul Karim',          'rezaul@constructtrack.com',  $1, 'worker',  '⚙️'),
    ('Sumaiya Khatun',        'sumaiya@constructtrack.com', $1, 'worker',  '🧱')
    ON CONFLICT DO NOTHING
  `, [hashedPassword]);

  await client.query(`
    INSERT INTO projects (name, description, status, budget, start_date, end_date, location, manager_id, created_by) VALUES
    ('Skyline Tower Complex',    'A 45-floor mixed-use development with commercial and residential units', 'active',    12500000, '2024-01-15', '2025-12-31', 'Motijheel, Dhaka',        2, 1),
    ('Harbor Bridge Renovation', 'Complete structural renovation of the historic harbor bridge',           'active',     4800000, '2024-03-01', '2025-06-30', 'Buriganga Riverfront',    3, 1),
    ('Green Valley Residences',  'Eco-friendly residential complex with 120 units',                       'planning',   6200000, '2024-06-01', '2026-03-31', 'Uttara, Dhaka',           2, 1),
    ('Metro Station Expansion',  'Underground metro station capacity expansion project',                   'completed',  3100000, '2023-06-01', '2024-04-30', 'Agargaon, Dhaka',         3, 1),
    ('Corporate HQ Fitout',      'Interior fit-out for corporate headquarters',                            'on_hold',    1800000, '2024-04-01', '2024-10-31', 'Gulshan-2, Dhaka',        2, 1)
    ON CONFLICT DO NOTHING
  `);

  await client.query(`
    INSERT INTO tasks (project_id, title, description, status, priority, progress, assigned_to, due_date) VALUES
    (1, 'Foundation Excavation',       'Complete basement and foundation excavation work',              'completed',   'critical', 100, 4, '2024-03-15'),
    (1, 'Structural Steel Framework',  'Install main structural steel columns and beams floors 1-20',  'in_progress', 'critical',  65, 4, '2024-08-30'),
    (1, 'Electrical Rough-In',         'Complete primary electrical conduit installation',              'in_progress', 'high',      40, 5, '2024-09-15'),
    (1, 'Plumbing Core Installation',  'Install main plumbing risers and core systems',                'pending',     'high',       0, 5, '2024-10-01'),
    (1, 'Curtain Wall Installation',   'Install glass curtain wall facade system',                     'pending',     'medium',     0, 6, '2025-01-15'),
    (2, 'Bridge Inspection',           'Complete structural assessment of all bridge elements',         'completed',   'critical', 100, 6, '2024-03-30'),
    (2, 'Deck Replacement Phase 1',    'Replace concrete deck panels sections A-D',                    'in_progress', 'critical',  55, 4, '2024-07-30'),
    (2, 'Cable Tension Adjustment',    'Recalibrate main suspension cables',                           'pending',     'high',       0, 5, '2024-09-01'),
    (3, 'Site Survey & Planning',      'Complete topographic survey and site analysis',                'completed',   'high',     100, 7, '2024-05-15'),
    (3, 'Permit Applications',         'Submit all required construction permits',                     'in_progress', 'high',      70, 8, '2024-07-01'),
    (4, 'Platform Extension',          'Extend platform A and B by 80 meters each',                   'completed',   'critical', 100, 4, '2024-03-01'),
    (4, 'Ventilation System',          'Install new ventilation and air management system',            'completed',   'high',     100, 6, '2024-04-15')
  `);

  await client.query(`
    INSERT INTO materials (project_id, name, unit, quantity_ordered, quantity_used, unit_cost, supplier) VALUES
    (1, 'Structural Steel Beams (W14)', 'tons',         850,   420,  1850, 'SteelPro Industries'),
    (1, 'Ready Mix Concrete (40MPa)',   'cubic meters', 12000, 5800,  185, 'ConcreteMax Ltd'),
    (1, 'Curtain Wall Glass Panels',    'sq meters',    8500,    0,   320, 'GlazeTech Solutions'),
    (1, 'Electrical Conduit (50mm)',    'meters',      45000, 18000,  8.5, 'ElecSupply Co'),
    (2, 'Bridge Deck Concrete Mix',     'cubic meters', 3200,  1750,  195, 'ConcreteMax Ltd'),
    (2, 'Waterproofing Membrane',       'sq meters',   12000,  5200,   45, 'WaterSeal Pro'),
    (2, 'High-Tensile Steel Rebar',     'tons',          180,    92, 1200, 'SteelPro Industries'),
    (3, 'Foundation Concrete',          'cubic meters', 4500,     0,  185, 'ConcreteMax Ltd'),
    (3, 'Insulation Panels (R-30)',     'sq meters',   25000,     0,   28, 'EcoInsulate Ltd')
  `);

  await client.query(`
    INSERT INTO budget_entries (project_id, category, description, planned_cost, actual_cost, date) VALUES
    (1, 'labor',     'Foundation & Structural Labor Q1',    850000,  920000, '2024-01-15'),
    (1, 'materials', 'Structural Steel & Concrete Supply', 2200000, 2180000, '2024-02-01'),
    (1, 'equipment', 'Tower Crane Rental (12 months)',      480000,  480000, '2024-01-15'),
    (1, 'labor',     'MEP Installation Labor Q2',           620000,  595000, '2024-04-01'),
    (1, 'overhead',  'Site Management & Safety Q1-Q2',      180000,  195000, '2024-01-15'),
    (2, 'labor',     'Bridge Inspection & Deck Labor',      380000,  410000, '2024-03-01'),
    (2, 'materials', 'Concrete, Steel & Waterproofing',     920000,  875000, '2024-03-15'),
    (2, 'equipment', 'Heavy Equipment & Scaffolding',       240000,  255000, '2024-03-01'),
    (3, 'labor',     'Site Survey & Planning Labor',         45000,   42000, '2024-06-01'),
    (3, 'materials', 'Initial Materials Procurement',       180000,       0, '2024-06-15'),
    (4, 'labor',     'Platform Extension Labor',            520000,  515000, '2023-06-01'),
    (4, 'materials', 'Construction Materials',              980000, 1020000, '2023-07-01'),
    (4, 'equipment', 'Tunneling Equipment',                 380000,  395000, '2023-06-01'),
    (4, 'overhead',  'Project Management & Admin',          120000,  118000, '2023-06-01')
  `);

  console.log('✅ Demo data seeded with Bangladeshi names');
  console.log('🔑 Password for all accounts: password123');
}
