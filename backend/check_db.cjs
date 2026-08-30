require('dotenv').config();
const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name").then(r => {
  console.log('✅ Connected to database');
  console.log('Existing tables:', r.rows.map(t => t.table_name) || []);
  return pool.end();
}).catch(e => { 
  console.error('❌ Database connection failed:', e.message); 
  process.exit(1); 
});
