import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // One-time compatibility for databases that still contain the retired eight-theme
  // taxonomy. schema.sql now seeds the seven editorial themes using the same IDs,
  // so clear only the known legacy rows before applying the schema. Once converted,
  // later deploys no longer match this condition.
  await pool.query(`
    DO $$
    BEGIN
      IF to_regclass('public.themes') IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM themes
           WHERE slug IN (
             'net-doai','sac-muong','kien-truc','hoa-lac-xanh',
             'nang-hoa-lac','cau-chuyen','uoc-mo','sac-mau'
           )
         ) THEN
        DELETE FROM themes WHERE id BETWEEN 1 AND 8;
      END IF;
    END $$;
  `);

  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = (await fs.readdir(migrationsDir).catch(() => []))
    .filter(name => name.endsWith('.sql'))
    .sort();

  for (const filename of files) {
    const alreadyApplied = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE filename=$1 LIMIT 1',
      [filename]
    );
    if (alreadyApplied.rowCount) {
      console.log('Skipped migration:', filename);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, filename), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations(filename) VALUES($1) ON CONFLICT(filename) DO NOTHING',
        [filename]
      );
      await client.query('COMMIT');
      console.log('Applied migration:', filename);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  console.log('HALO HOLA database schema applied.');
} finally {
  await pool.end();
}
