import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const name = process.env.ADMIN_SEED_NAME;
const email = process.env.ADMIN_SEED_EMAIL?.toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD;

if (!name || !email || !password) {
  console.error('Missing ADMIN_SEED_NAME / ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD in backend/.env');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, account_status)
     VALUES ($1,$2,$3,'ADMIN','ACTIVE')
     ON CONFLICT (email) DO UPDATE SET
       name=EXCLUDED.name, password_hash=EXCLUDED.password_hash,
       role='ADMIN', account_status='ACTIVE', updated_at=NOW()`,
    [name, email, hash]
  );
  console.log(`Admin ready: ${email}`);
} finally {
  await pool.end();
}
