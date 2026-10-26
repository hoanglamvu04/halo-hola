import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sendCommunityVerificationCode } from './mail.service.js';

export const EMAIL_CODE_PURPOSE = Object.freeze({
  VERIFY: 'VERIFY_EMAIL',
  RESET: 'RESET_PASSWORD'
});
const OTP_TTL_MINUTES = 10;
const SESSION_TTL_DAYS = 30;
const REGISTER_TTL_MINUTES = 30;
const EMAIL_REQUEST_LIMIT = 5;
const dummyHash = bcrypt.hash('not-a-real-halo-hola-password', 12);

export const normalizeCommunityEmail = value => String(value || '').trim().toLowerCase();

function digest(value) {
  return crypto.createHmac('sha256', env.jwtSecret).update(String(value)).digest('hex');
}

export function hashCommunityEmailCode(purpose, email, code) {
  if (!Object.values(EMAIL_CODE_PURPOSE).includes(purpose)) throw new Error('Unsupported OTP purpose');
  return digest(['community-email-otp', purpose, normalizeCommunityEmail(email), String(code)].join(':'));
}

export function passwordIsValid(password) {
  return typeof password === 'string' &&
    password.length >= 8 && password.length <= 72 &&
    Buffer.byteLength(password, 'utf8') <= 72;
}

function assertPassword(password) {
  if (!passwordIsValid(password)) {
    throw new AppError('Mật khẩu cần từ 8 đến 72 ký tự (tối đa 72 byte).', 400);
  }
}

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id, email: row.email, name: row.name || '',
    displayName: row.display_name || '', phone: row.phone || '',
    bio: row.bio || '', avatarUrl: row.avatar_url || '',
    emailVerifiedAt: row.email_verified_at,
    hasPassword: Boolean(row.password_hash),
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

async function linkExistingContributions(client, account) {
  await client.query(
    'UPDATE submissions SET contributor_id=$1 WHERE contributor_id IS NULL AND LOWER(email)=$2 AND is_demo=FALSE',
    [account.id, normalizeCommunityEmail(account.email)]
  );
}

async function startSession(client, accountId, userAgent) {
  const token = crypto.randomBytes(32).toString('base64url');
  await client.query(
    "INSERT INTO community_sessions(account_id,token_hash,user_agent,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '30 days')",
    [accountId, digest('session:' + token), String(userAgent || '').trim().slice(0, 500) || null]
  );
  return token;
}

function constantTimeCodeMatch(expected, actual) {
  if (!/^[a-f0-9]{64}$/i.test(String(actual || ''))) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
}

async function consumeCode(client, email, purpose, code) {
  const { rows } = await client.query(
    `SELECT id,code_hash FROM community_login_codes
     WHERE email=$1 AND purpose=$2 AND consumed_at IS NULL AND expires_at>NOW()
       AND attempt_count<5
     ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
    [email, purpose]
  );
  const item = rows[0];
  if (!item) return false;
  if (!constantTimeCodeMatch(hashCommunityEmailCode(purpose, email, code), item.code_hash)) {
    // Return false instead of throwing here: the transaction must COMMIT
    // the increment so attackers cannot retry wrong codes without a limit.
    await client.query(
      'UPDATE community_login_codes SET attempt_count=attempt_count+1 WHERE id=$1',
      [item.id]
    );
    return false;
  }
  await client.query('UPDATE community_login_codes SET consumed_at=NOW() WHERE id=$1', [item.id]);
  return true;
}

async function issueEmailCode(email, purpose, ip) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total, MAX(created_at) AS latest
     FROM community_login_codes
     WHERE email=$1 AND purpose=$2 AND created_at>NOW()-INTERVAL '15 minutes'`,
    [email, purpose]
  );
  if (Number(rows[0]?.total || 0) >= EMAIL_REQUEST_LIMIT) {
    throw new AppError('Bạn đã yêu cầu quá nhiều mã. Vui lòng thử lại sau 15 phút.', 429);
  }
  const latest = rows[0]?.latest ? new Date(rows[0].latest).getTime() : 0;
  if (latest && Date.now() - latest < 45_000) {
    throw new AppError('Vui lòng đợi khoảng 45 giây trước khi gửi lại mã.', 429);
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  const codeHash = hashCommunityEmailCode(purpose, email, code);
  await withTransaction(async client => {
    await client.query(
      `UPDATE community_login_codes SET consumed_at=NOW()
       WHERE email=$1 AND purpose=$2 AND consumed_at IS NULL`,
      [email, purpose]
    );
    await client.query(
      `INSERT INTO community_login_codes(email,purpose,code_hash,expires_at,request_ip)
       VALUES($1,$2,$3,NOW()+INTERVAL '10 minutes',$4)`,
      [email, purpose, codeHash, String(ip || '').slice(0, 120) || null]
    );
  });

  try {
    const delivery = await sendCommunityVerificationCode({
      to: email, code, purpose, expiresInMinutes: OTP_TTL_MINUTES
    });
    if (delivery?.skipped && env.nodeEnv === 'production') {
      throw new AppError('Email chưa được cấu hình. Vui lòng liên hệ quản trị viên.', 503);
    }
  } catch (error) {
    await pool.query(
      `UPDATE community_login_codes SET consumed_at=NOW()
       WHERE email=$1 AND purpose=$2 AND code_hash=$3 AND consumed_at IS NULL`,
      [email, purpose, codeHash]
    ).catch(() => {});
    if (error instanceof AppError) throw error;
    console.warn('Community verification email failed:', error?.code || error?.name || 'SMTP_ERROR');
    throw new AppError('Chưa thể gửi mã qua email. Vui lòng thử lại hoặc liên hệ quản trị viên.', 503);
  }

  return {
    ok: true, expiresIn: OTP_TTL_MINUTES * 60,
    ...(env.nodeEnv === 'production' ? {} : { devCode: code })
  };
}

export async function registerCommunityWithPassword({ email, name, password, ip }) {
  assertPassword(password);
  const normalized = normalizeCommunityEmail(email);
  const previous = await pool.query(
    'SELECT password_hash,status FROM community_accounts WHERE email=$1 LIMIT 1',
    [normalized]
  );
  const existing = previous.rows[0];
  if (existing?.status === 'BLOCKED') throw new AppError('Tài khoản đã bị khóa.', 403);
  if (existing?.password_hash) {
    throw new AppError('Email đã có tài khoản. Vui lòng đăng nhập hoặc chọn Quên mật khẩu.', 409);
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO community_registration_requests(email,name,password_hash,expires_at)
     VALUES($1,$2,$3,NOW()+INTERVAL '30 minutes')
     ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,
       password_hash=EXCLUDED.password_hash,expires_at=EXCLUDED.expires_at,updated_at=NOW()`,
    [normalized, String(name).trim(), hash]
  );
  return issueEmailCode(normalized, EMAIL_CODE_PURPOSE.VERIFY, ip);
}

export async function resendCommunityVerification({ email, ip }) {
  const normalized = normalizeCommunityEmail(email);
  const pending = await pool.query(
    'SELECT 1 FROM community_registration_requests WHERE email=$1 AND expires_at>NOW()',
    [normalized]
  );
  if (!pending.rowCount) {
    throw new AppError('Yêu cầu đăng ký đã hết hạn. Vui lòng đăng ký lại.', 400);
  }
  return issueEmailCode(normalized, EMAIL_CODE_PURPOSE.VERIFY, ip);
}

export async function verifyCommunityEmail({ email, code, userAgent }) {
  const normalized = normalizeCommunityEmail(email);
  const result = await withTransaction(async client => {
    const correct = await consumeCode(client, normalized, EMAIL_CODE_PURPOSE.VERIFY, code);
    if (!correct) return { kind: 'INVALID' };

    const pending = await client.query(
      `SELECT * FROM community_registration_requests
       WHERE email=$1 AND expires_at>NOW() FOR UPDATE`, [normalized]
    );
    const request = pending.rows[0];
    if (!request) return { kind: 'EXPIRED' };

    const { rows } = await client.query(
      `INSERT INTO community_accounts
       (email,name,password_hash,email_verified_at,last_login_at)
       VALUES($1,$2,$3,NOW(),NOW())
       ON CONFLICT(email) DO UPDATE SET
         password_hash=EXCLUDED.password_hash,
         email_verified_at=COALESCE(community_accounts.email_verified_at,NOW()),
         last_login_at=NOW(),updated_at=NOW(),
         name=CASE WHEN COALESCE(community_accounts.name,'')=''
           THEN EXCLUDED.name ELSE community_accounts.name END
       WHERE community_accounts.password_hash IS NULL AND community_accounts.status='ACTIVE'
       RETURNING *`,
      [normalized, request.name, request.password_hash]
    );
    const account = rows[0];
    if (!account) return { kind: 'EXISTS' };

    await client.query('DELETE FROM community_registration_requests WHERE email=$1', [normalized]);
    await linkExistingContributions(client, account);
    const token = await startSession(client, account.id, userAgent);
    return { account: serialize(account), token };
  });
  if (result.kind === 'INVALID') throw new AppError('Mã xác minh chưa đúng, đã hết hạn hoặc đã được sử dụng.', 400);
  if (result.kind === 'EXPIRED') throw new AppError('Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.', 400);
  if (result.kind === 'EXISTS') throw new AppError('Email đã có tài khoản. Vui lòng đăng nhập.', 409);
  return result;
}

export async function loginCommunityWithPassword({ email, password, userAgent }) {
  const normalized = normalizeCommunityEmail(email);
  const { rows } = await pool.query(
    'SELECT * FROM community_accounts WHERE email=$1 LIMIT 1', [normalized]
  );
  const account = rows[0];
  const compareHash = account?.password_hash || await dummyHash;
  const matches = await bcrypt.compare(password, compareHash);
  if (!matches || !account || account.status !== 'ACTIVE' || !account.email_verified_at) {
    throw new AppError('Email hoặc mật khẩu không đúng.', 401);
  }
  return withTransaction(async client => {
    const updated = await client.query(
      `UPDATE community_accounts SET last_login_at=NOW(),updated_at=NOW()
       WHERE id=$1 AND status='ACTIVE' AND email_verified_at IS NOT NULL
       RETURNING *`, [account.id]
    );
    if (!updated.rows[0]) throw new AppError('Không thể đăng nhập tài khoản này.', 403);
    await linkExistingContributions(client, updated.rows[0]);
    const token = await startSession(client, account.id, userAgent);
    return { account: serialize(updated.rows[0]), token };
  });
}

export async function requestCommunityPasswordReset({ email, ip }) {
  const normalized = normalizeCommunityEmail(email);
  const { rows } = await pool.query(
    `SELECT id FROM community_accounts WHERE email=$1 AND status='ACTIVE'
     AND email_verified_at IS NOT NULL AND password_hash IS NOT NULL LIMIT 1`,
    [normalized]
  );
  // Do not reveal whether an email has an account.
  if (!rows.length) return { ok: true, expiresIn: OTP_TTL_MINUTES * 60 };
  return issueEmailCode(normalized, EMAIL_CODE_PURPOSE.RESET, ip);
}

export async function resetCommunityPassword({ email, code, password, userAgent }) {
  assertPassword(password);
  const normalized = normalizeCommunityEmail(email);
  const hash = await bcrypt.hash(password, 12);
  const result = await withTransaction(async client => {
    const correct = await consumeCode(client, normalized, EMAIL_CODE_PURPOSE.RESET, code);
    if (!correct) return { kind: 'INVALID' };
    const updated = await client.query(
      `UPDATE community_accounts SET password_hash=$2,updated_at=NOW(),
         last_login_at=NOW() WHERE email=$1 AND status='ACTIVE'
         AND email_verified_at IS NOT NULL AND password_hash IS NOT NULL
       RETURNING *`, [normalized, hash]
    );
    if (!updated.rows[0]) return { kind: 'INVALID' };
    await client.query('DELETE FROM community_sessions WHERE account_id=$1', [updated.rows[0].id]);
    const token = await startSession(client, updated.rows[0].id, userAgent);
    await linkExistingContributions(client, updated.rows[0]);
    return { account: serialize(updated.rows[0]), token };
  });
  if (result.kind === 'INVALID') throw new AppError('Mã đặt lại mật khẩu không đúng hoặc đã hết hạn.', 400);
  return result;
}
