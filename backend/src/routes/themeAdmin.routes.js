import { Router } from 'express';
import { pool } from '../database/pool.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

const router=Router();
router.use(authenticateAdmin);

router.get('/',async(_req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT id,slug,title,description,intro,image,color,
             location_label AS "locationLabel",sort_order AS "sortOrder",published
      FROM themes
      ORDER BY sort_order ASC,id ASC
    `);
    res.json(rows);
  }catch(error){next(error);}
});

router.put('/:id',async(req,res,next)=>{
  const client=await pool.connect();
  try{
    const id=Number(req.params.id);
    if(!Number.isInteger(id)||id<=0) throw new AppError('Chủ đề không hợp lệ.',400);

    const title=String(req.body?.title||'').trim();
    const description=String(req.body?.description||'').trim();
    const intro=String(req.body?.intro||'').trim();
    const image=String(req.body?.image||'').trim();
    const color=String(req.body?.color||'').trim();
    const locationLabel=String(req.body?.locationLabel||'Hòa Lạc').trim();
    const sortOrder=Number(req.body?.sortOrder);
    const published=req.body?.published!==false;

    if(!title) throw new AppError('Tên chủ đề không được để trống.',400);
    if(title.length>180) throw new AppError('Tên chủ đề quá dài.',400);
    if(description.length>500) throw new AppError('Mô tả ngắn quá dài.',400);
    if(intro.length>3000) throw new AppError('Phần giới thiệu quá dài.',400);

    await client.query('BEGIN');
    const current=await client.query('SELECT id,title FROM themes WHERE id=$1 FOR UPDATE',[id]);
    if(!current.rows[0]) throw new AppError('Không tìm thấy chủ đề.',404);
    const oldTitle=current.rows[0].title;

    const {rows}=await client.query(`
      UPDATE themes SET
        title=$2,description=$3,intro=$4,image=$5,color=$6,
        location_label=$7,sort_order=$8,published=$9
      WHERE id=$1
      RETURNING id,slug,title,description,intro,image,color,
                location_label AS "locationLabel",sort_order AS "sortOrder",published
    `,[id,title,description,intro,image||null,color||null,locationLabel,Number.isFinite(sortOrder)?sortOrder:0,published]);

    if(oldTitle!==title){
      await client.query('UPDATE submissions SET theme=$1 WHERE theme=$2',[title,oldTitle]);
    }

    await client.query('COMMIT');
    res.json(rows[0]);
  }catch(error){
    await client.query('ROLLBACK').catch(()=>{});
    next(error);
  }finally{client.release();}
});

export default router;
