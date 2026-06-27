const pg = require('pg');
const pool = new pg.Pool({
  connectionString: 'postgresql://todo_app_nr3k_user:MQoEbP97Irh60OJfF1HdLsMgKvdplLnm@dpg-d8vc43ugvqtc73c2ov70-a.oregon-postgres.render.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});
pool.query("SELECT 1 FROM pg_database WHERE datname='constructtrack'").then(r => {
  if (r.rows.length === 0) {
    return pool.query('CREATE DATABASE constructtrack').then(() => console.log('Created constructtrack DB'));
  } else {
    console.log('constructtrack DB already exists');
  }
}).then(() => pool.end()).catch(e => { console.error(e.message); process.exit(1); });
