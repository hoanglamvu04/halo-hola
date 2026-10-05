import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { pool } from '../database/pool.js';
import { getMediaDownloadUrl } from '../services/submission.service.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/artworks', async (req, res, next) => {
  try {
    const values = [];
    const conditions = ["s.status <> 'REJECTED'"];

    if (req.query.theme) {
      values.push(String(req.query.theme));
      conditions.push(`s.theme = $${values.length}`);
    }
    if (req.query.type) {
      values.push(String(req.query.type));
      conditions.push(`s.type = $${values.length}`);
    }
    if (req.query.color) {
      values.push(String(req.query.color));
      conditions.push(`s.color = $${values.length}`);
    }

    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 52));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    values.push(limit);
    const limitParam = values.length;
    values.push(offset);
    const offsetParam = values.length;

    const { rows } = await pool.query(`
      SELECT s.id, LOWER(s.code) AS slug, s.code, s.title,
             COALESCE(NULLIF(s.display_name,''), s.name) AS author,
             s.type, s.theme, s.color, s.location, s.story,
             s.status, s.is_demo AS "isDemo", s.allow_media_use AS "allowMediaUse",
             s.created_at AS "createdAt",
             media.media_id AS "mediaId",
             COALESCE(jury.avg_score,0)::float AS "juryScore",
             COUNT(*) OVER()::int AS "totalCount"
      FROM submissions s
      LEFT JOIN LATERAL (
        SELECT m.id AS media_id
        FROM submission_media m
        WHERE m.submission_id = s.id
        ORDER BY m.created_at ASC
        LIMIT 1
      ) media ON TRUE
      LEFT JOIN LATERAL (
        SELECT ROUND(AVG(js.weighted_total),2) AS avg_score
        FROM jury_scores js
        WHERE js.submission_id = s.id
          AND js.submitted = TRUE
          AND js.conflict_of_interest = FALSE
      ) jury ON TRUE
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        CASE s.status
          WHEN 'AWARDED' THEN 0
          WHEN 'TOP52' THEN 1
          WHEN 'SHORTLIST' THEN 2
          WHEN 'VALID' THEN 3
          WHEN 'PENDING' THEN 4
          ELSE 5
        END,
        jury.avg_score DESC NULLS LAST,
        s.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `, values);

    const hydrated = await Promise.all(rows.map(async (row) => {
      let image = '';
      if (row.mediaId) {
        try {
          const media = await getMediaDownloadUrl(row.mediaId);
          image = media?.url || '';
        } catch {}
      }
      const { mediaId, ...item } = row;
      return { ...item, image, preview: true };
    }));

    res.json(hydrated);
  } catch (error) {
    next(error);
  }
});

export default router;
