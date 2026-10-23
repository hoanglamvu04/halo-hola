import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

function normalizeDriveUrl(value) {
  const raw=String(value||'').trim();
  if(!raw) throw new AppError('Hãy dán link thư mục Google Drive chứa ảnh.',400);
  let url;
  try{ url=new URL(raw); }catch{ throw new AppError('Link Google Drive chưa hợp lệ.',400); }
  const host=url.hostname.toLowerCase();
  if(host!=='drive.google.com' && host!=='docs.google.com') {
    throw new AppError('Vui lòng dùng link Google Drive.',400);
  }
  return url.toString();
}

function normalizeDate(value) {
  const capturedOn=String(value||'').trim();
  if(capturedOn && !/^\d{4}-\d{2}-\d{2}$/.test(capturedOn)) {
    throw new AppError('Ngày chụp chưa hợp lệ.',400);
  }
  return capturedOn || null;
}

async function resolvePlace(placeId,placeName) {
  const normalizedId=String(placeId||'').trim() || null;
  if(normalizedId){
    const place=(await pool.query(
      'SELECT id,name FROM places WHERE id=$1 AND published=TRUE',
      [normalizedId]
    )).rows[0];
    if(!place) throw new AppError('Địa điểm đã chọn không tồn tại hoặc chưa công bố.',400);
    return {placeId:place.id,placeName:place.name};
  }
  const name=String(placeName||'').trim();
  if(!name) throw new AppError('Hãy chọn hoặc nhập địa điểm chụp.',400);
  return {placeId:null,placeName:name};
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
  const place=await resolvePlace(input.placeId,input.placeName);
  const capturedOn=normalizeDate(input.capturedOn);
  const driveUrl=normalizeDriveUrl(input.driveUrl);
  const notes=String(input.notes||'').trim()||null;
  const title=String(input.title||'').trim() || `${place.placeName} · ${capturedOn||'Hôm nay'}`;

  const { rows }=await pool.query(
    `INSERT INTO photographer_shoots
      (photographer_id,place_id,place_name,title,captured_on,notes,drive_url,status)
     VALUES ($1,$2,$3,$4,COALESCE($5::date,CURRENT_DATE),$6,$7,'COMPLETE')
     RETURNING *`,
    [userId,place.placeId,place.placeName,title,capturedOn,notes,driveUrl]
  );
  return rows[0];
}

export async function listPhotographerShoots(userId) {
  const { rows }=await pool.query(
    `SELECT *
     FROM photographer_shoots
     WHERE photographer_id=$1
     ORDER BY captured_on DESC,created_at DESC`,
    [userId]
  );
  return rows;
}

export async function updatePhotographerShoot(userId,id,input={}) {
  const current=(await pool.query(
    'SELECT * FROM photographer_shoots WHERE id=$1 AND photographer_id=$2',
    [id,userId]
  )).rows[0];
  if(!current) throw new AppError('Không tìm thấy lần nộp ảnh.',404);

  const hasPlaceUpdate=input.placeId!==undefined || input.placeName!==undefined;
  const place=hasPlaceUpdate
    ? await resolvePlace(input.placeId,input.placeName)
    : {placeId:current.place_id,placeName:current.place_name};
  const capturedOn=input.capturedOn===undefined
    ? String(current.captured_on).slice(0,10)
    : normalizeDate(input.capturedOn);
  const driveUrl=input.driveUrl===undefined ? current.drive_url : normalizeDriveUrl(input.driveUrl);
  const notes=input.notes===undefined ? current.notes : (String(input.notes||'').trim()||null);
  const title=String(input.title===undefined?current.title:input.title||'').trim()
    || `${place.placeName} · ${capturedOn}`;

  const { rows }=await pool.query(
    `UPDATE photographer_shoots
     SET place_id=$3,place_name=$4,title=$5,captured_on=$6::date,notes=$7,drive_url=$8,updated_at=NOW()
     WHERE id=$1 AND photographer_id=$2
     RETURNING *`,
    [id,userId,place.placeId,place.placeName,title,capturedOn,notes,driveUrl]
  );
  return rows[0];
}

export async function listPhotographers() {
  const { rows }=await pool.query(`
    SELECT
      u.id,u.name,u.email,u.role,
      u.account_status AS "accountStatus",
      u.last_login_at AS "lastLoginAt",
      u.created_at AS "createdAt",
      p.phone,p.notes,p.sort_order AS "sortOrder",
      COALESCE(s.shoot_count,0)::int AS "shootCount"
    FROM users u
    LEFT JOIN photographer_profiles p ON p.photographer_id=u.id
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS shoot_count
      FROM photographer_shoots ps
      WHERE ps.photographer_id=u.id
    ) s ON TRUE
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
    `SELECT s.*,u.name AS photographer_name,u.email AS photographer_email
     FROM photographer_shoots s
     JOIN users u ON u.id=s.photographer_id
     ${where}
     ORDER BY s.captured_on DESC,s.created_at DESC
     LIMIT 500`,
    values
  );
  return rows;
}
