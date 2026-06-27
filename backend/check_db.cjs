const pg = require('pg');
const pool = new pg.Pool({
  connectionString: 'postgresql://todo_app_nr3k_user:MQoEbP97Irh60OJfF1HdLsMgKvdplLnm@dpg-d8vc43ugvqtc73c2ov70-a.oregon-postgres.render.com:5432/todo_app_nr3k',
  ssl: { rejectUnauthorized: false },
});
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name").then(r => {
  console.log('Existing tables:', r.rows.map(t => t.table_name));
  return pool.end();
}).catch(e => { console.error(e); process.exit(1); });
