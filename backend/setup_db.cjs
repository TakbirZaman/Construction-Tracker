require('dotenv').config();
const pg = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  try {
    console.log('🔄 Checking database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Connected to database');

    console.log('🔄 Running migrations...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✅ Database schema created successfully');
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
