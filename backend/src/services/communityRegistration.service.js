import crypto from 'node:crypto';
import { pool } from '../database/pool.js';

const PREFIX = {
  WE_HOLA: 'WH26',
  HOLA_DAY: 'HD26'
};

async function generateCode(program) {
  const prefix = PREFIX[program] || 'HH26';
  for (let i = 0; i < 10; i += 1) {
    const code = `${prefix}-${crypto.randomInt(1, 99999).toString().padStart(5, '0')}`;
    const { rowCount } = await pool.query(
      'SELECT 1 FROM community_registrations WHERE code = $1',
      [code]
    );
    if (!rowCount) return code;
  }
  return `${prefix}-${Date.now().toString().slice(-5)}`;
}

export async function registerCommunity(program, data) {
  const code = await generateCode(program);
  const { rows } = await pool.query(
    `INSERT INTO community_registrations
      (code,program,name,email,phone,role_label,interest,note,allow_updates)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id,code,program,name,email,phone,role_label,interest,note,allow_updates,status,created_at`,
    [
      code,
      program,
      data.name,
      data.email.toLowerCase(),
      data.phone,
      data.roleLabel || null,
      data.interest || null,
      data.note || null,
      Boolean(data.allowUpdates)
    ]
  );
  return rows[0];
}

export async function listCommunityRegistrations(program) {
  const values = [];
  const where = program ? 'WHERE program = $1' : '';
  if (program) values.push(program);
  const { rows } = await pool.query(
    `SELECT id,code,program,name,email,phone,role_label,interest,note,allow_updates,status,created_at,updated_at
     FROM community_registrations
     ${where}
     ORDER BY created_at DESC`,
    values
  );
  return rows;
}
