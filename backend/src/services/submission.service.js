import crypto from 'node:crypto';
import { pool, withTransaction } from '../database/pool.js';

async function generateCode(client) {
  for (let i = 0; i < 12; i += 1) {
    const code = 'HH26-' + crypto.randomInt(1, 99999).toString().padStart(5, '0');
    const { rowCount } = await client.query('SELECT 1 FROM submissions WHERE code = $1', [code]);
    if (!rowCount) return code;
  }
  return 'HH26-' + Date.now().toString().slice(-5);
}

function normalizeBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

export async function createSubmission(data, files = []) {
  return withTransaction(async (client) => {
    const code = await generateCode(client);
    const result = await client.query(
      `INSERT INTO submissions
       (code,name,display_name,email,phone,bio,type,theme,color,location,story,allow_media_use,allow_newsletter)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        code, data.name, data.displayName || null, data.email.toLowerCase(),
        data.phone || null, data.bio || null, data.type, data.theme,
        data.color || null, data.location, data.story,
        normalizeBoolean(data.allowMediaUse, true),
        normalizeBoolean(data.allowNewsletter, false)
      ]
    );

    const submission = result.rows[0];
    const media = [];

    for (const file of files) {
      const inserted = await client.query(
        `INSERT INTO submission_media
         (submission_id,url,original_name,mime_type,size_bytes)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [
          submission.id,
          '/uploads/' + file.filename,
          file.originalname,
          file.mimetype,
          file.size
        ]
      );
      media.push(inserted.rows[0]);
    }

    return { ...submission, media };
  });
}

export async function listSubmissions(status) {
  const values = [];
  let where = '';
  if (status) {
    values.push(status);
    where = 'WHERE s.status = $1';
  }

  const { rows } = await pool.query(
    `SELECT s.*,
       COALESCE(
         json_agg(
           json_build_object(
             'id', m.id,
             'url', m.url,
             'originalName', m.original_name,
             'mimeType', m.mime_type,
             'size', m.size_bytes
           )
         ) FILTER (WHERE m.id IS NOT NULL),
         '[]'::json
       ) AS media
     FROM submissions s
     LEFT JOIN submission_media m ON m.submission_id = s.id
     ${where}
     GROUP BY s.id
     ORDER BY s.created_at DESC`,
    values
  );

  return rows;
}

export async function updateSubmissionStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE submissions
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );
  return rows[0] || null;
}
