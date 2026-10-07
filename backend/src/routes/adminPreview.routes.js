import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { pool } from '../database/pool.js';
import { getMediaDownloadUrl } from '../services/submission.service.js';

const router = Router();
router.use(authenticateAdmin);
const showcaseFirst=`(s.code LIKE 'HH26-SHOW%' OR NOT EXISTS (SELECT 1 FROM submissions sx WHERE sx.code LIKE 'HH26-SHOW%'))`;

router.get('/artworks', async (req, res, next) => {
  try {
    const values = [];
    const conditions = ["s.status <> 'REJECTED'",showcaseFirst];

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

router.get('/top52', async (req, res, next) => {
  try {
    const values = [];
    const conditions = ["s.status IN ('TOP52','AWARDED')",showcaseFirst];

    const q = String(req.query.q || '').trim();
    if (q) {
      values.push(`%${q}%`);
      const p = `$${values.length}`;
      conditions.push(`(s.code ILIKE ${p} OR COALESCE(s.title,'') ILIKE ${p} OR s.name ILIKE ${p} OR COALESCE(s.display_name,'') ILIKE ${p} OR COALESCE(s.location,'') ILIKE ${p})`);
    }
    if (req.query.theme) {
      values.push(String(req.query.theme));
      conditions.push(`s.theme = $${values.length}`);
    }
    if (req.query.type) {
      values.push(String(req.query.type));
      conditions.push(`s.type = $${values.length}`);
    }
    if (req.query.award === 'true') conditions.push(`s.status = 'AWARDED'`);

    const limit = Math.max(1, Math.min(52, Number(req.query.limit) || 16));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    values.push(limit);
    const limitParam = values.length;
    values.push(offset);
    const offsetParam = values.length;

    const { rows } = await pool.query(`
      SELECT s.id, LOWER(s.code) AS slug, s.code, s.title,
             COALESCE(NULLIF(s.display_name,''), s.name) AS author,
             s.type, s.theme, s.color, s.location, s.story,
             s.captured_at AS "capturedAt", s.status,
             s.is_demo AS "isDemo", s.allow_media_use AS "allowMediaUse",
             s.created_at AS "createdAt", s.published_at AS "publishedAt",
             media.media_id AS "mediaId",
             COALESCE(jury.avg_score,0)::float AS "juryScore",
             COALESCE(awards.types,'[]'::json) AS "selectionTypes",
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
      LEFT JOIN LATERAL (
        SELECT COALESCE(json_agg(DISTINCT sel.selection_type),'[]'::json) AS types
        FROM jury_selections sel
        WHERE sel.submission_id = s.id
          AND sel.selection_type IN ('TOP3_THEME','THEME_WINNER','COLOR_WINNER','TITLE_FINALIST')
      ) awards ON TRUE
      WHERE ${conditions.join(' AND ')}
      ORDER BY CASE WHEN s.status = 'AWARDED' THEN 0 ELSE 1 END,
               jury.avg_score DESC NULLS LAST,
               s.created_at DESC,
               s.code ASC
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
      const { mediaId, totalCount, ...item } = row;
      return { ...item, image, preview: true };
    }));

    const total = rows[0]?.totalCount || 0;
    res.json({
      items: hydrated,
      total,
      meta: {
        preview: true,
        selectedCount: total,
        publishedCount: 0,
        round: null
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/artworks/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, LOWER(s.code) AS slug, s.code, s.title,
             COALESCE(NULLIF(s.display_name,''), s.name) AS author,
             s.type, s.theme, s.color, s.location, s.story,
             s.captured_at AS "capturedAt", s.status,
             s.is_demo AS "isDemo", s.allow_media_use AS "allowMediaUse",
             s.created_at AS "createdAt",
             COALESCE(jury.avg_score,0)::float AS "juryScore"
      FROM submissions s
      LEFT JOIN LATERAL (
        SELECT ROUND(AVG(js.weighted_total),2) AS avg_score
        FROM jury_scores js
        WHERE js.submission_id = s.id
          AND js.submitted = TRUE
          AND js.conflict_of_interest = FALSE
      ) jury ON TRUE
      WHERE s.id = $1 AND s.status <> 'REJECTED'
      LIMIT 1
    `, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Không tìm thấy tác phẩm để xem trước.' });

    const mediaResult = await pool.query(`
      SELECT id, mime_type AS "mimeType", original_name AS "originalName"
      FROM submission_media
      WHERE submission_id = $1
      ORDER BY created_at ASC
    `, [req.params.id]);

    const media = (await Promise.all(mediaResult.rows.map(async (entry) => {
      try {
        const download = await getMediaDownloadUrl(entry.id);
        if (!download?.url) return null;
        return { ...entry, url: download.url };
      } catch {
        return null;
      }
    }))).filter(Boolean);

    res.json({
      ...rows[0],
      media,
      image: media[0]?.url || '',
      preview: true
    });
  } catch (error) {
    next(error);
  }
});

export default router;
