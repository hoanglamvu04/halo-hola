import crypto from 'node:crypto';
import { pool, withTransaction } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { EMAIL_CODE_PURPOSE, hashCommunityEmailCode } from './communityPasswordAuth.service.js';

const COOKIE_NAME='halo_hola_community_session';
const SESSION_TTL_DAYS=30;

const normalizeEmail=value=>String(value||'').trim().toLowerCase();
const clean=value=>String(value||'').trim();

function digest(value){
  return crypto.createHmac('sha256',env.jwtSecret).update(String(value)).digest('hex');
}

function parseCookies(header=''){
  return String(header||'').split(';').reduce((acc,part)=>{
    const index=part.indexOf('=');
    if(index<0)return acc;
    const key=part.slice(0,index).trim();
    const value=part.slice(index+1).trim();
    if(key) acc[key]=decodeURIComponent(value);
    return acc;
  },{});
}

function serializeAccount(row){
  if(!row)return null;
  return {
    id:row.id,
    email:row.email,
    name:row.name||'',
    displayName:row.display_name||'',
    phone:row.phone||'',
    bio:row.bio||'',
    avatarUrl:row.avatar_url||'',
    emailVerifiedAt:row.email_verified_at,
    hasPassword:Boolean(row.password_hash),
    createdAt:row.created_at,
    updatedAt:row.updated_at
  };
}

function cookieParts(token,maxAge){
  const parts=[
    `${COOKIE_NAME}=${encodeURIComponent(token||'')}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`
  ];
  if(env.nodeEnv==='production') parts.push('Secure');
  return parts.join('; ');
}

export function setCommunitySessionCookie(res,token){
  res.setHeader('Set-Cookie',cookieParts(token,SESSION_TTL_DAYS*24*60*60));
}

export function clearCommunitySessionCookie(res){
  res.setHeader('Set-Cookie',cookieParts('',0));
}

export function getCommunitySessionToken(req){
  return parseCookies(req.headers.cookie||'')[COOKIE_NAME]||'';
}

export async function resolveCommunityAccount(req){
  const token=getCommunitySessionToken(req);
  if(!token)return null;
  const tokenHash=digest(`session:${token}`);
  const {rows}=await pool.query(
    `SELECT a.*
     FROM community_sessions s
     JOIN community_accounts a ON a.id=s.account_id
     WHERE s.token_hash=$1
       AND s.expires_at>NOW()
       AND a.status='ACTIVE'
     LIMIT 1`,
    [tokenHash]
  );
  const account=rows[0];
  if(!account)return null;
  pool.query('UPDATE community_sessions SET last_seen_at=NOW() WHERE token_hash=$1',[tokenHash]).catch(()=>{});
  return serializeAccount(account);
}

export async function requireCommunityAccount(req){
  const account=await resolveCommunityAccount(req);
  if(!account)throw new AppError('Vui lòng đăng nhập tài khoản cộng đồng.',401);
  return account;
}

export async function updateCommunityProfile(accountId,input){
  const {rows}=await pool.query(
    `UPDATE community_accounts SET
       name=$2,
       display_name=NULLIF($3,''),
       phone=NULLIF($4,''),
       bio=NULLIF($5,''),
       updated_at=NOW()
     WHERE id=$1 AND status='ACTIVE'
     RETURNING *`,
    [
      accountId,
      clean(input.name),
      clean(input.displayName),
      clean(input.phone),
      clean(input.bio)
    ]
  );
  if(!rows[0])throw new AppError('Không tìm thấy tài khoản cộng đồng.',404);
  return serializeAccount(rows[0]);
}

export async function listCommunitySubmissions(accountId){
  // Attach unclaimed guest submissions only after a verified user session.
  await pool.query(
    `UPDATE submissions SET contributor_id=$1
     WHERE contributor_id IS NULL AND is_demo=FALSE
       AND LOWER(email)=(SELECT LOWER(email) FROM community_accounts WHERE id=$1)`,
    [accountId]
  );
  const {rows}=await pool.query(
    `SELECT
       s.id,s.code,s.title,s.type,s.theme,s.color,s.location,s.status,
       s.publication_state AS "publicationState",
       s.published_at AS "publishedAt",
       s.created_at AS "createdAt",
       s.updated_at AS "updatedAt",
       COUNT(m.id)::int AS "mediaCount"
     FROM submissions s
     LEFT JOIN submission_media m ON m.submission_id=s.id
     WHERE s.contributor_id=$1 AND s.is_demo=FALSE
     GROUP BY s.id
     ORDER BY s.created_at DESC`,
    [accountId]
  );
  return rows;
}

export async function logoutCommunitySession(req){
  const token=getCommunitySessionToken(req);
  if(!token)return;
  const tokenHash=digest(`session:${token}`);
  await pool.query('DELETE FROM community_sessions WHERE token_hash=$1',[tokenHash]);
}


export async function listAdminCommunityLoginCodes({q='',limit=100}={}){
  const values=[];
  const conditions=[];
  const search=clean(q);
  if(search){
    values.push('%'+search.toLowerCase()+'%');
    conditions.push(`LOWER(c.email) LIKE $${values.length}`);
  }
  values.push(Math.max(1,Math.min(200,Number(limit)||100)));
  const limitParam=values.length;
  const where=conditions.length?'WHERE '+conditions.join(' AND '):'';
  const {rows}=await pool.query(
    `SELECT
       c.id,c.email,c.purpose,
       c.expires_at AS "expiresAt",
       c.consumed_at AS "consumedAt",
       c.attempt_count AS "attemptCount",
       c.request_ip AS "requestIp",
       c.created_at AS "createdAt",
       a.id AS "accountId",
       a.name AS "accountName",
       a.display_name AS "accountDisplayName",
       CASE
         WHEN c.consumed_at IS NOT NULL THEN 'USED'
         WHEN c.expires_at<=NOW() THEN 'EXPIRED'
         ELSE 'ACTIVE'
       END AS status
     FROM community_login_codes c
     LEFT JOIN community_accounts a ON a.email=c.email
     ${where}
     ORDER BY c.created_at DESC
     LIMIT $${limitParam}`,
    values
  );
  return rows;
}

export async function issueAdminCommunityLoginCode({email,expiresInMinutes=10,purpose='VERIFY_EMAIL'}){
  const normalized=normalizeEmail(email);
  const ttl=Math.max(5,Math.min(60,Number(expiresInMinutes)||10));
  if(!Object.values(EMAIL_CODE_PURPOSE).includes(purpose)){
    throw new AppError('Mục đích xác minh không hợp lệ.',400);
  }

  const valid=purpose===EMAIL_CODE_PURPOSE.VERIFY
    ? await pool.query(
      'SELECT 1 FROM community_registration_requests WHERE email=$1 AND expires_at>NOW()',
      [normalized])
    : await pool.query(
      `SELECT 1 FROM community_accounts WHERE email=$1 AND status='ACTIVE'
       AND password_hash IS NOT NULL AND email_verified_at IS NOT NULL`,
      [normalized]);
  if(!valid.rowCount){
    throw new AppError(purpose===EMAIL_CODE_PURPOSE.VERIFY
      ? 'Email này chưa có yêu cầu đăng ký chờ xác minh.'
      : 'Không tìm thấy tài khoản có mật khẩu để đặt lại.',400);
  }

  const code=crypto.randomInt(0,1000000).toString().padStart(6,'0');
  const codeHash=hashCommunityEmailCode(purpose,normalized,code);

  return withTransaction(async(client)=>{
    await client.query(
      `UPDATE community_login_codes
       SET consumed_at=COALESCE(consumed_at,NOW())
       WHERE email=$1 AND purpose=$2 AND consumed_at IS NULL`,
      [normalized,purpose]
    );
    const {rows}=await client.query(
      `INSERT INTO community_login_codes(email,purpose,code_hash,expires_at,request_ip)
       VALUES($1,$2,$3,NOW()+($4::text || ' minutes')::interval,'ADMIN')
       RETURNING id,email,purpose,expires_at AS "expiresAt",created_at AS "createdAt"`,
      [normalized,purpose,codeHash,String(ttl)]
    );
    return {...rows[0],code,expiresIn:ttl*60};
  });
}

export async function revokeAdminCommunityLoginCode(id){
  const {rows}=await pool.query(
    `UPDATE community_login_codes
     SET consumed_at=COALESCE(consumed_at,NOW())
     WHERE id=$1
     RETURNING id,email,expires_at AS "expiresAt",consumed_at AS "consumedAt",created_at AS "createdAt"`,
    [id]
  );
  return rows[0]||null;
}
