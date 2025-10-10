const fs = require('fs');
const { Pool } = require('pg');

async function applySchema() {
  // tsx should load .env.local automatically
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is not set. Make sure you have a .env.local file.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();

  try {
    console.log('Applying database schema...');
    const sql = fs.readFileSync('./scripts/schema.sql', 'utf8');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema();