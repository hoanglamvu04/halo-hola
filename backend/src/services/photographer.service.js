import crypto from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
  createR2Client,
  getR2Buckets,
  putR2Object,
  deleteR2Object,
  createDownloadUrl,
  createUploadUrl,
  headR2Object
} from '../storage/r2.js';

const PREVIEWABLE_MIMES = new Set([
  'image/jpeg','image/png','image/webp','image/avif'
]);

const DIRECT_UPLOAD_MAX_FILES=30;
const DIRECT_UPLOAD_MAX_BYTES=100*1024*1024;
const DIRECT_UPLOAD_TYPES=new Map([
  ['.jpg',new Set(['image/jpeg'])],
  ['.jpeg',new Set(['image/jpeg'])],
  ['.png',new Set(['image/png'])],
  ['.webp',new Set(['image/webp'])],
  ['.avif',new Set(['image/avif'])],
  ['.tif',new Set(['image/tiff'])],
  ['.tiff',new Set(['image/tiff'])],
  ['.dng',new Set(['image/x-adobe-dng','application/octet-stream'])],
  ['.cr2',new Set(['image/x-canon-cr2','application/octet-stream'])],
  ['.nef',new Set(['image/x-nikon-nef','application/octet-stream'])],
  ['.arw',new Set(['image/x-sony-arw','application/octet-stream'])]
]);

function normalizeDirectUploadFile(input={}) {
  const originalName=String(input.name||input.originalName||'').trim();
  const size=Number(input.size);
  const ext=path.extname(originalName).toLowerCase();
  const allowed=DIRECT_UPLOAD_TYPES.get(ext);
  if(!originalName || !allowed) throw new AppError('Định dạng ảnh không được hỗ trợ.',400);
  if(!Number.isInteger(size) || size<=0 || size>DIRECT_UPLOAD_MAX_BYTES) {
    throw new AppError('Mỗi file phải lớn hơn 0 và không vượt quá 100 MB.',400);
  }
  const requested=String(input.type||input.mimeType||'').trim().toLowerCase();
  const contentType=requested && allowed.has(requested)
    ? requested
    : (allowed.has('application/octet-stream')?'application/octet-stream':[...allowed][0]);
  if(requested && !allowed.has(requested) && requested!=='application/octet-stream') {
    throw new AppError('MIME type không khớp phần mở rộng file.',400);
  }
  return {
    clientId:String(input.clientId||'').trim()||null,
    originalName,
    size,
    contentType
  };
}

async function getOwnedShoot(userId,shootId) {
  const shoot=(await pool.query(
    'SELECT * FROM photographer_shoots WHERE id=$1 AND photographer_id=$2',
    [shootId,userId]
  )).rows[0];
  if(!shoot) throw new AppError('Buổi chụp không tồn tại hoặc không thuộc tài khoản này.',404);
  if(shoot.status==='ARCHIVED') throw new AppError('Buổi chụp đã lưu trữ, không thể tải thêm ảnh.',409);
  return shoot;
}

function safeName(name='photo') {
  const ext=path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g,'');
  const base=path.basename(name,path.extname(name))
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9-_]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,90) || 'photo';
  return base+ext;
}

function hasR2Originals() {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_ORIGINALS
  );
}

async function sha256File(filePath) {
  const hash=crypto.createHash('sha256');
  await new Promise((resolve,reject)=>{
    const stream=fs.createReadStream(filePath);
    stream.on('data',chunk=>hash.update(chunk));
    stream.on('end',resolve);
    stream.on('error',reject);
  });
  return hash.digest('hex');
}

async function decorateAsset(row) {
  let url=null;
  if(row.storage_provider==='R2' && row.bucket && row.object_key){
    url=await createDownloadUrl({
      client:createR2Client(),
      bucket:row.bucket,
      key:row.object_key,
      expiresIn:3600
    }).catch(()=>null);
  }
  return {
    ...row,
    url,
    previewable:PREVIEWABLE_MIMES.has(String(row.mime_type||'').toLowerCase())
  };
}

function normalizeShootInput(input={}) {
  const title=String(input.title||'').trim();
  const placeName=String(input.placeName||'').trim();
  const capturedOn=String(input.capturedOn||'').trim();
  const notes=String(input.notes||'').trim();
  const placeId=String(input.placeId||'').trim() || null;
  if(title.length<2) throw new AppError('Tên buổi chụp cần ít nhất 2 ký tự.',400);
  if(capturedOn && !/^\d{4}-\d{2}-\d{2}$/.test(capturedOn)) {
    throw new AppError('Ngày chụp chưa hợp lệ.',400);
  }
  return {title,placeName,capturedOn:capturedOn||null,notes:notes||null,placeId};
}

export async function listPhotographerPlaces() {
  const { rows }=await pool.query(
    `SELECT id,name,category,lat,lng
     FROM places
     WHERE published=TRUE
     ORDER BY sort_order ASC,name ASC
     LIMIT 300`
  );
  return rows;
}

export async function createPhotographerShoot(userId,input={}) {
  const data=normalizeShootInput(input);
  let placeName=data.placeName;
  if(data.placeId){
    const place=(await pool.query(
      'SELECT id,name FROM places WHERE id=$1 AND published=TRUE',
      [data.placeId]
    )).rows[0];
    if(!place) throw new AppError('Địa điểm đã chọn không tồn tại hoặc chưa công bố.',400);
    placeName=place.name;
  }
  if(!placeName) throw new AppError('Hãy chọn hoặc nhập địa điểm chụp.',400);

  const { rows }=await pool.query(
    `INSERT INTO photographer_shoots
      (photographer_id,place_id,place_name,title,captured_on,notes)
     VALUES ($1,$2,$3,$4,COALESCE($5::date,CURRENT_DATE),$6)
     RETURNING *`,
    [userId,data.placeId,placeName,data.title,data.capturedOn,data.notes]
  );
  return rows[0];
}

export async function listPhotographerShoots(userId) {
  const { rows }=await pool.query(
    `SELECT s.*,
       COUNT(a.id)::int AS asset_count,
       COALESCE(SUM(a.size_bytes),0)::bigint AS total_bytes
     FROM photographer_shoots s
     LEFT JOIN photographer_assets a ON a.shoot_id=s.id
     WHERE s.photographer_id=$1
     GROUP BY s.id
     ORDER BY s.captured_on DESC,s.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function updatePhotographerShoot(userId,id,input={}) {
  const current=(await pool.query(
    'SELECT * FROM photographer_shoots WHERE id=$1 AND photographer_id=$2',
    [id,userId]
  )).rows[0];
  if(!current) throw new AppError('Không tìm thấy buổi chụp.',404);

  let placeId=input.placeId===undefined?current.place_id:(String(input.placeId||'').trim()||null);
  let placeName=input.placeName===undefined?current.place_name:String(input.placeName||'').trim();
  if(placeId){
    const place=(await pool.query('SELECT name FROM places WHERE id=$1 AND published=TRUE',[placeId])).rows[0];
    if(!place) throw new AppError('Địa điểm đã chọn không tồn tại hoặc chưa công bố.',400);
    placeName=place.name;
  }
  const title=input.title===undefined?current.title:String(input.title||'').trim();
  const capturedOn=input.capturedOn===undefined?current.captured_on:String(input.capturedOn||'').trim();
  const notes=input.notes===undefined?current.notes:String(input.notes||'').trim()||null;
  const status=['OPEN','COMPLETE','ARCHIVED'].includes(input.status)?input.status:current.status;
  if(title.length<2) throw new AppError('Tên buổi chụp chưa hợp lệ.',400);
  if(!placeName) throw new AppError('Địa điểm chụp không được để trống.',400);

  const { rows }=await pool.query(
    `UPDATE photographer_shoots
     SET place_id=$3,place_name=$4,title=$5,captured_on=$6::date,notes=$7,status=$8,updated_at=NOW()
     WHERE id=$1 AND photographer_id=$2
     RETURNING *`,
    [id,userId,placeId,placeName,title,capturedOn,notes,status]
  );
  return rows[0];
}

export async function createPhotographerUploadTickets({user,shootId,files=[]}) {
  if(!Array.isArray(files) || !files.length) throw new AppError('Chưa chọn ảnh để tải lên.',400);
  if(files.length>DIRECT_UPLOAD_MAX_FILES) throw new AppError('Mỗi lượt chỉ tạo tối đa 30 file upload.',400);
  if(!hasR2Originals()) throw new AppError('R2 originals chưa được cấu hình trên máy chủ.',503);

  const shoot=await getOwnedShoot(user.id,shootId);
  const client=createR2Client();
  const bucket=getR2Buckets().originals;
  const shootDate=String(shoot.captured_on).slice(0,10);
  const normalized=files.map(normalizeDirectUploadFile);

  return Promise.all(normalized.map(async file=>{
    const key=[
      'photographers',
      user.id,
      shootDate,
      shoot.id,
      `${crypto.randomUUID()}-${safeName(file.originalName)}`
    ].join('/');
    const uploadUrl=await createUploadUrl({
      client,
      bucket,
      key,
      contentType:file.contentType,
      expiresIn:900
    });
    return {
      clientId:file.clientId,
      key,
      uploadUrl,
      originalName:file.originalName,
      contentType:file.contentType,
      size:file.size,
      expiresIn:900
    };
  }));
}

export async function finalizePhotographerUploads({user,shootId,uploads=[]}) {
  if(!Array.isArray(uploads) || !uploads.length) throw new AppError('Không có file để xác nhận.',400);
  if(uploads.length>DIRECT_UPLOAD_MAX_FILES) throw new AppError('Mỗi lượt chỉ xác nhận tối đa 30 file.',400);
  if(!hasR2Originals()) throw new AppError('R2 originals chưa được cấu hình trên máy chủ.',503);

  const shoot=await getOwnedShoot(user.id,shootId);
  const client=createR2Client();
  const bucket=getR2Buckets().originals;
  const prefix=`photographers/${user.id}/${String(shoot.captured_on).slice(0,10)}/${shoot.id}/`;
  const saved=[];

  for(const input of uploads){
    const file=normalizeDirectUploadFile(input);
    const key=String(input.key||'').trim();
    if(!key.startsWith(prefix) || key.length<=prefix.length) {
      throw new AppError('Object key R2 không hợp lệ cho buổi chụp này.',403);
    }

    let head;
    try{
      head=await headR2Object({client,bucket,key});
    }catch{
      throw new AppError(`R2 chưa nhận file: ${file.originalName}`,409);
    }

    if(Number(head.ContentLength)!==file.size){
      await deleteR2Object({client,bucket,key}).catch(()=>{});
      throw new AppError(`Kích thước file trên R2 không khớp: ${file.originalName}`,409);
    }

    const existing=(await pool.query(
      `SELECT a.*,s.title AS shoot_title,s.place_name,s.captured_on
       FROM photographer_assets a
       JOIN photographer_shoots s ON s.id=a.shoot_id
       WHERE a.object_key=$1 AND a.photographer_id=$2 AND a.shoot_id=$3
       LIMIT 1`,
      [key,user.id,shoot.id]
    )).rows[0];

    if(existing){
      saved.push(await decorateAsset(existing));
      continue;
    }

    const { rows }=await pool.query(
      `INSERT INTO photographer_assets
        (shoot_id,photographer_id,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,sha256)
       VALUES ($1,$2,$3,$4,$5,'R2',$6,$7,NULL)
       RETURNING *`,
      [shoot.id,user.id,file.originalName,file.contentType,file.size,bucket,key]
    );
    saved.push(await decorateAsset({
      ...rows[0],
      shoot_title:shoot.title,
      place_name:shoot.place_name,
      captured_on:shoot.captured_on
    }));
  }

  return saved;
}

export async function storePhotographerAssets({user,shootId,files=[]}) {
  if(!files.length) throw new AppError('Chưa chọn ảnh để tải lên.',400);
  const shoot=(await pool.query(
    'SELECT * FROM photographer_shoots WHERE id=$1 AND photographer_id=$2',
    [shootId,user.id]
  )).rows[0];
  if(!shoot) throw new AppError('Buổi chụp không tồn tại hoặc không thuộc tài khoản này.',404);
  if(shoot.status==='ARCHIVED') throw new AppError('Buổi chụp đã lưu trữ, không thể tải thêm ảnh.',409);

  if(!hasR2Originals()) {
    throw new AppError('R2 originals chưa được cấu hình trên máy chủ.',503);
  }

  const client=createR2Client();
  const bucket=getR2Buckets().originals;
  const stored=[];

  for(const file of files){
    const hash=await sha256File(file.path);
    const key=[
      'photographers',
      user.id,
      String(shoot.captured_on).slice(0,10),
      shoot.id,
      `${crypto.randomUUID()}-${safeName(file.originalname)}`
    ].join('/');

    try{
      await putR2Object({
        client,
        bucket,
        key,
        body:fs.createReadStream(file.path),
        contentType:file.mimetype || 'application/octet-stream',
        metadata:{
          uploader:user.id,
          shoot:shoot.id,
          originalname:encodeURIComponent(file.originalname)
        }
      });

      const { rows }=await pool.query(
        `INSERT INTO photographer_assets
          (shoot_id,photographer_id,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,sha256)
         VALUES ($1,$2,$3,$4,$5,'R2',$6,$7,$8)
         RETURNING *`,
        [shoot.id,user.id,file.originalname,file.mimetype||'application/octet-stream',file.size,bucket,key,hash]
      );
      stored.push(rows[0]);
    }catch(error){
      await deleteR2Object({client,bucket,key}).catch(()=>{});
      throw error;
    }finally{
      await fsPromises.unlink(file.path).catch(()=>{});
    }
  }

  return Promise.all(stored.map(decorateAsset));
}

export async function listPhotographerAssets(userId,{shootId}={}) {
  const values=[userId];
  let where='a.photographer_id=$1';
  if(shootId){
    values.push(shootId);
    where+=` AND a.shoot_id=$${values.length}`;
  }
  const { rows }=await pool.query(
    `SELECT a.*,s.title AS shoot_title,s.place_name,s.captured_on
     FROM photographer_assets a
     JOIN photographer_shoots s ON s.id=a.shoot_id
     WHERE ${where}
     ORDER BY a.created_at DESC
     LIMIT 500`,
    values
  );
  return Promise.all(rows.map(decorateAsset));
}

export async function deletePhotographerAsset(userId,id) {
  const asset=(await pool.query(
    'SELECT * FROM photographer_assets WHERE id=$1 AND photographer_id=$2',
    [id,userId]
  )).rows[0];
  if(!asset) throw new AppError('Không tìm thấy ảnh.',404);
  if(asset.storage_provider==='R2' && asset.bucket && asset.object_key){
    await deleteR2Object({
      client:createR2Client(),
      bucket:asset.bucket,
      key:asset.object_key
    });
  }else if(asset.object_key){
    await fsPromises.unlink(path.join(process.cwd(),env.uploadDir,asset.object_key)).catch(()=>{});
  }
  await pool.query('DELETE FROM photographer_assets WHERE id=$1',[id]);
  return {id};
}

export async function listPhotographers() {
  const { rows }=await pool.query(`
    SELECT
      u.id,u.name,u.email,u.role,
      u.account_status AS "accountStatus",
      u.last_login_at AS "lastLoginAt",
      u.created_at AS "createdAt",
      p.phone,p.notes,p.sort_order AS "sortOrder",
      COALESCE(s.shoot_count,0)::int AS "shootCount",
      COALESCE(a.asset_count,0)::int AS "assetCount",
      COALESCE(a.total_bytes,0)::bigint AS "totalBytes"
    FROM users u
    LEFT JOIN photographer_profiles p ON p.photographer_id=u.id
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS shoot_count
      FROM photographer_shoots ps
      WHERE ps.photographer_id=u.id
    ) s ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS asset_count,COALESCE(SUM(size_bytes),0)::bigint AS total_bytes
      FROM photographer_assets pa
      WHERE pa.photographer_id=u.id
    ) a ON TRUE
    WHERE u.role='PHOTOGRAPHER'
    ORDER BY COALESCE(p.sort_order,999),u.created_at ASC
  `);
  return rows;
}

export async function createPhotographer(input={}) {
  const name=String(input.name||'').trim();
  const email=String(input.email||'').trim().toLowerCase();
  const password=String(input.password||'');
  const phone=String(input.phone||'').trim()||null;
  const notes=String(input.notes||'').trim()||null;
  const sortOrder=Number.isFinite(Number(input.sortOrder))?Number(input.sortOrder):0;
  if(name.length<2) throw new AppError('Tên nhiếp ảnh gia cần ít nhất 2 ký tự.',400);
  if(!email.includes('@')) throw new AppError('Email đăng nhập chưa hợp lệ.',400);
  if(password.length<8) throw new AppError('Mật khẩu cần ít nhất 8 ký tự.',400);
  const passwordHash=await bcrypt.hash(password,12);

  return withTransaction(async client=>{
    const duplicate=await client.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)',[email]);
    if(duplicate.rowCount) throw new AppError('Email này đã được sử dụng.',409);
    const { rows }=await client.query(
      `INSERT INTO users(name,email,password_hash,role,account_status)
       VALUES ($1,$2,$3,'PHOTOGRAPHER',$4)
       RETURNING id,name,email,role,account_status AS "accountStatus",created_at AS "createdAt"`,
      [name,email,passwordHash,input.accountStatus==='SUSPENDED'?'SUSPENDED':'ACTIVE']
    );
    await client.query(
      `INSERT INTO photographer_profiles(photographer_id,phone,notes,sort_order)
       VALUES ($1,$2,$3,$4)`,
      [rows[0].id,phone,notes,sortOrder]
    );
    return rows[0];
  });
}

export async function updatePhotographer(id,input={}) {
  return withTransaction(async client=>{
    const current=(await client.query(
      "SELECT * FROM users WHERE id=$1 AND role='PHOTOGRAPHER'",
      [id]
    )).rows[0];
    if(!current) throw new AppError('Không tìm thấy tài khoản nhiếp ảnh.',404);

    const name=input.name===undefined?current.name:String(input.name||'').trim();
    const email=input.email===undefined?current.email:String(input.email||'').trim().toLowerCase();
    if(name.length<2 || !email.includes('@')) throw new AppError('Tên hoặc email chưa hợp lệ.',400);
    const duplicate=await client.query(
      'SELECT id FROM users WHERE LOWER(email)=LOWER($1) AND id<>$2',
      [email,id]
    );
    if(duplicate.rowCount) throw new AppError('Email này đã được sử dụng.',409);
    const status=input.accountStatus==='SUSPENDED'?'SUSPENDED':(input.accountStatus==='ACTIVE'?'ACTIVE':current.account_status);
    const { rows }=await client.query(
      `UPDATE users SET name=$2,email=$3,account_status=$4,updated_at=NOW()
       WHERE id=$1
       RETURNING id,name,email,role,account_status AS "accountStatus",last_login_at AS "lastLoginAt"`,
      [id,name,email,status]
    );
    const profile=(await client.query(
      'SELECT phone,notes,sort_order FROM photographer_profiles WHERE photographer_id=$1',
      [id]
    )).rows[0]||{};
    await client.query(
      `INSERT INTO photographer_profiles(photographer_id,phone,notes,sort_order,updated_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (photographer_id) DO UPDATE SET
         phone=EXCLUDED.phone,notes=EXCLUDED.notes,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
      [
        id,
        input.phone===undefined?(profile.phone||null):(String(input.phone||'').trim()||null),
        input.notes===undefined?(profile.notes||null):(String(input.notes||'').trim()||null),
        input.sortOrder===undefined?Number(profile.sort_order||0):(Number.isFinite(Number(input.sortOrder))?Number(input.sortOrder):0)
      ]
    );
    return rows[0];
  });
}

export async function resetPhotographerPassword(id,password) {
  const next=String(password||'');
  if(next.length<8) throw new AppError('Mật khẩu mới cần ít nhất 8 ký tự.',400);
  const hash=await bcrypt.hash(next,12);
  const { rows }=await pool.query(
    `UPDATE users SET password_hash=$2,updated_at=NOW()
     WHERE id=$1 AND role='PHOTOGRAPHER'
     RETURNING id,name,email`,
    [id,hash]
  );
  if(!rows[0]) throw new AppError('Không tìm thấy tài khoản nhiếp ảnh.',404);
  return {ok:true,user:rows[0]};
}

export async function listTeamShoots({photographerId}={}) {
  const values=[];
  let where='';
  if(photographerId){
    values.push(photographerId);
    where='WHERE s.photographer_id=$1';
  }
  const { rows }=await pool.query(
    `SELECT s.*,u.name AS photographer_name,u.email AS photographer_email,
       COUNT(a.id)::int AS asset_count,
       COALESCE(SUM(a.size_bytes),0)::bigint AS total_bytes
     FROM photographer_shoots s
     JOIN users u ON u.id=s.photographer_id
     LEFT JOIN photographer_assets a ON a.shoot_id=s.id
     ${where}
     GROUP BY s.id,u.name,u.email
     ORDER BY s.captured_on DESC,s.created_at DESC
     LIMIT 500`,
    values
  );
  return rows;
}

export async function listTeamAssets({photographerId,shootId}={}) {
  const where=[];
  const values=[];
  if(photographerId){
    values.push(photographerId);
    where.push(`a.photographer_id=$${values.length}`);
  }
  if(shootId){
    values.push(shootId);
    where.push(`a.shoot_id=$${values.length}`);
  }
  const { rows }=await pool.query(
    `SELECT a.*,s.title AS shoot_title,s.place_name,s.captured_on,
       u.name AS photographer_name,u.email AS photographer_email
     FROM photographer_assets a
     JOIN photographer_shoots s ON s.id=a.shoot_id
     JOIN users u ON u.id=a.photographer_id
     ${where.length?'WHERE '+where.join(' AND '):''}
     ORDER BY a.created_at DESC
     LIMIT 500`,
    values
  );
  return Promise.all(rows.map(decorateAsset));
}
