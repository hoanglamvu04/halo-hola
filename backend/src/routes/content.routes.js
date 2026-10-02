import { Router } from 'express';
import { pool } from '../database/pool.js';

const router = Router();

router.get('/places', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,slug,name,category,lat,lng,image,description FROM places WHERE published = TRUE ORDER BY name ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/tours', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id,number,title,dates,kicker,description,image,status FROM tours WHERE status <> 'DRAFT' ORDER BY number ASC"
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/stories', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,slug,title,author,excerpt,content,image,created_at FROM stories WHERE published = TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default router;
