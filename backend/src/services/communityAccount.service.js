import crypto from 'node:crypto';
import { pool, withTransaction } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sendCommunityLoginCode } from './mail.service.js';

const COOKIE_NAME='halo_hola_community_session';
const OTP_TTL_MINUTES=10;
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

export async function requestCommunityLoginCode({email,ip}){
  const normalized=normalizeEmail(email);
  const recent=await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM community_login_codes
     WHERE email=$1 AND created_at>NOW()-INTERVAL '15 minutes'`,
    [normalized]
  );
  if(Number(recent.rows[0]?.count||0)>=5){
    throw new AppError('Bạn đã yêu cầu quá nhiều mã. Hãy thử lại sau ít phút.',429);
  }

  const code=crypto.randomInt(0,1000000).toString().padStart(6,'0');
  const codeHash=digest(`otp:${normalized}:${code}`);
  await pool.query(
    `INSERT INTO community_login_codes(email,code_hash,expires_at,request_ip)
     VALUES($1,$2,NOW()+INTERVAL '${OTP_TTL_MINUTES} minutes',$3)`,
    [normalized,codeHash,clean(ip).slice(0,120)||null]
  );

  const delivery=await sendCommunityLoginCode({to:normalized,code,expiresInMinutes:OTP_TTL_MINUTES});
  if(delivery?.skipped&&env.nodeEnv==='production'){
    throw new AppError('Dịch vụ gửi mã đăng nhập tạm thời chưa sẵn sàng.',503);
  }

  await pool.query(
    `DELETE FROM community_login_codes
     WHERE expires_at<NOW()-INTERVAL '1 day' OR consumed_at<NOW()-INTERVAL '1 day'`
  ).catch(()=>{});

  return {
    ok:true,
    expiresIn:OTP_TTL_MINUTES*60,
    ...(env.nodeEnv==='production'?{}:{devCode:code})
  };
}

export async function verifyCommunityLoginCode({email,code,userAgent}){
  const normalized=normalizeEmail(email);
  const inputCode=clean(code);

  return withTransaction(async(client)=>{
    const codeResult=await client.query(
      `SELECT *
       FROM community_login_codes
       WHERE email=$1
         AND consumed_at IS NULL
         AND expires_at>NOW()
         AND attempt_count<5
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [normalized]
    );
    const loginCode=codeResult.rows[0];
    if(!loginCode)throw new AppError('Mã đăng nhập đã hết hạn. Hãy yêu cầu mã mới.',400);

    const expected=digest(`otp:${normalized}:${inputCode}`);
    if(expected!==loginCode.code_hash){
      await client.query(
        'UPDATE community_login_codes SET attempt_count=attempt_count+1 WHERE id=$1',
        [loginCode.id]
      );
      throw new AppError('Mã đăng nhập chưa đúng.',400);
    }

    await client.query(
      'UPDATE community_login_codes SET consumed_at=NOW() WHERE id=$1',
      [loginCode.id]
    );

    const previous=await client.query(
      `SELECT name,display_name,phone,bio
       FROM submissions
       WHERE LOWER(email)=$1 AND is_demo=FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalized]
    );
    const profile=previous.rows[0]||{};

    const accountResult=await client.query(
      `INSERT INTO community_accounts
       (email,name,display_name,phone,bio,email_verified_at,last_login_at)
       VALUES($1,$2,$3,$4,$5,NOW(),NOW())
       ON CONFLICT(email) DO UPDATE SET
         email_verified_at=NOW(),
         last_login_at=NOW(),
         updated_at=NOW(),
         name=CASE WHEN COALESCE(community_accounts.name,'')='' THEN EXCLUDED.name ELSE community_accounts.name END,
         display_name=CASE WHEN COALESCE(community_accounts.display_name,'')='' THEN EXCLUDED.display_name ELSE community_accounts.display_name END,
         phone=CASE WHEN COALESCE(community_accounts.phone,'')='' THEN EXCLUDED.phone ELSE community_accounts.phone END,
         bio=CASE WHEN COALESCE(community_accounts.bio,'')='' THEN EXCLUDED.bio ELSE community_accounts.bio END
       RETURNING *`,
      [
        normalized,
        profile.name||'',
        profile.display_name||null,
        profile.phone||null,
        profile.bio||null
      ]
    );
    const account=accountResult.rows[0];
    if(account.status!=='ACTIVE')throw new AppError('Tài khoản này đang bị khóa.',403);

    await client.query(
      `UPDATE submissions
       SET contributor_id=$1
       WHERE contributor_id IS NULL AND LOWER(email)=$2`,
      [account.id,normalized]
    );

    const token=crypto.randomBytes(32).toString('base64url');
    const tokenHash=digest(`session:${token}`);
    await client.query(
      `DELETE FROM community_sessions
       WHERE account_id=$1 AND expires_at<NOW()`,
      [account.id]
    );
    await client.query(
      `INSERT INTO community_sessions(account_id,token_hash,user_agent,expires_at)
       VALUES($1,$2,$3,NOW()+INTERVAL '${SESSION_TTL_DAYS} days')`,
      [account.id,tokenHash,clean(userAgent).slice(0,500)||null]
    );

    return {account:serializeAccount(account),token};
  });
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
       c.id,c.email,
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

export async function issueAdminCommunityLoginCode({email,expiresInMinutes=10}){
  const normalized=normalizeEmail(email);
  const ttl=Math.max(5,Math.min(60,Number(expiresInMinutes)||10));
  const code=crypto.randomInt(0,1000000).toString().padStart(6,'0');
  const codeHash=digest(`otp:${normalized}:${code}`);

  return withTransaction(async(client)=>{
    await client.query(
      `UPDATE community_login_codes
       SET consumed_at=COALESCE(consumed_at,NOW())
       WHERE email=$1 AND consumed_at IS NULL AND expires_at>NOW()`,
      [normalized]
    );
    const {rows}=await client.query(
      `INSERT INTO community_login_codes(email,code_hash,expires_at,request_ip)
       VALUES($1,$2,NOW()+($3::text || ' minutes')::interval,'ADMIN')
       RETURNING id,email,expires_at AS "expiresAt",created_at AS "createdAt"`,
      [normalized,codeHash,String(ttl)]
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
