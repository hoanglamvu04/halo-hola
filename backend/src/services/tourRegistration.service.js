import crypto from 'node:crypto';
import { pool } from '../database/pool.js';

async function generateCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = 'HT26-' + crypto.randomInt(1, 9999).toString().padStart(4, '0');
    const { rowCount } = await pool.query('SELECT 1 FROM tour_registrations WHERE code = $1', [code]);
    if (!rowCount) return code;
  }
  return 'HT26-' + Date.now().toString().slice(-4);
}

export async function registerTour(data) {
  const code = await generateCode();
  const { rows } = await pool.query(
    `INSERT INTO tour_registrations
     (code,tour_number,name,email,phone,role_label,equipment,note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      code,
      data.tourNumber,
      data.name,
      data.email.toLowerCase(),
      data.phone,
      data.roleLabel || null,
      data.equipment || null,
      data.note || null
    ]
  );
  return rows[0];
}

export async function listTourRegistrations(tourNumber) {
  const values = [];
  const where = tourNumber ? 'WHERE tour_number = $1' : '';
  if (tourNumber) values.push(tourNumber);
  const { rows } = await pool.query(
    `SELECT * FROM tour_registrations ${where} ORDER BY created_at DESC`,
    values
  );
  return rows;
}
