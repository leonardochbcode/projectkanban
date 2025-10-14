require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const applySchema = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  const client = await pool.connect();
  console.log('Connected to database.');

  try {
    console.log('Reading schema file...');
    const sql = fs.readFileSync('./scripts/schema.sql', 'utf8');
    console.log('Applying schema...');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
};

applySchema();