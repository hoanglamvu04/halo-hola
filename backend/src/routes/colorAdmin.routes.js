import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/', async (_req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT id,slug,name,color_value AS color,story,sort_order AS "sortOrder",published
      FROM theme_colors
      ORDER BY sort_order ASC,id ASC
    `);
    res.json(rows);
  }catch(error){next(error);}
});

router.put('/:id', async (req,res,next)=>{
  try{
    const name=String(req.body?.name||'').trim();
    const color=String(req.body?.color||'').trim();
    if(!name) throw new AppError('Tên màu không được để trống.',400);
    if(name.length>80) throw new AppError('Tên màu tối đa 80 ký tự.',400);
    if(!/^#[0-9A-Fa-f]{6}$/.test(color)) throw new AppError('Mã màu phải ở dạng HEX, ví dụ #2F5A3D.',400);

    const {rows}=await pool.query(`
      UPDATE theme_colors
      SET name=$2,color_value=$3
      WHERE id=$1
      RETURNING id,slug,name,color_value AS color,story,sort_order AS "sortOrder",published
    `,[req.params.id,name,color.toUpperCase()]);
    if(!rows[0]) throw new AppError('Không tìm thấy màu.',404);
    res.json(rows[0]);
  }catch(error){next(error);}
});

export default router;
