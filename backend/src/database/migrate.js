import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.readdir(migrationsDir).catch(() => []);
  for (const filename of files.filter(name => name.endsWith('.sql')).sort()) {
    const sql = await fs.readFile(path.join(migrationsDir, filename), 'utf8');
    await pool.query(sql);
    console.log('Applied migration:', filename);
  }

  console.log('HALO HOLA database schema applied.');
} finally {
  await pool.end();
}
