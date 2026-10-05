import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

const THEMES = [
  'Nét Đoài tại Hòa Lạc','Sắc Mường Hòa Lạc','Không gian Kiến trúc Hòa Lạc','Hòa Lạc xanh',
  'Nắng Hòa Lạc','Câu chuyện Hòa Lạc','Ước mơ Hòa Lạc','Sắc màu Hòa Lạc'
];
const TYPES = ['Photo','Video','Story & Creative','Art & Design'];

function cleanList(value, allowed) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).filter(item => allowed.includes(item)))];
}

function normalizeProfile(input = {}) {
  return {
    title: String(input.title || '').trim() || null,
    organization: String(input.organization || '').trim() || null,
    phone: String(input.phone || '').trim() || null,
    expertise: String(input.expertise || '').trim() || null,
    notes: String(input.notes || '').trim() || null,
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
    allowedThemes: cleanList(input.allowedThemes, THEMES),
    allowedTypes: cleanList(input.allowedTypes, TYPES)
  };
}

export async function listJuryBoard() {
  const { rows } = await pool.query(`
    SELECT u.id,u.name,u.email,u.role,u.account_status AS "accountStatus",u.created_at AS "createdAt",u.updated_at AS "updatedAt",u.last_login_at AS "lastLoginAt",
      p.title,p.organization,p.phone,p.expertise,p.notes,p.sort_order AS "sortOrder",
      COALESCE(p.allowed_themes,'[]'::jsonb) AS "allowedThemes",
      COALESCE(p.allowed_types,'[]'::jsonb) AS "allowedTypes",
      COALESCE(s.submitted_count,0)::int AS "submittedCount",
      COALESCE(s.draft_count,0)::int AS "draftCount",
      COALESCE(s.conflict_count,0)::int AS "conflictCount",
      COALESCE(s.avg_score,0)::float AS "averageGivenScore",
      s.last_score_at AS "lastScoreAt",
      totals.total_submissions::int AS "totalSubmissions"
    FROM users u
    LEFT JOIN jury_profiles p ON p.juror_id=u.id
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE)::int AS submitted_count,
        COUNT(*) FILTER (WHERE js.submitted=FALSE AND js.conflict_of_interest=FALSE)::int AS draft_count,
        COUNT(*) FILTER (WHERE js.conflict_of_interest=TRUE)::int AS conflict_count,
        ROUND(AVG(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE),2) AS avg_score,
        MAX(js.updated_at) AS last_score_at
      FROM jury_scores js WHERE js.juror_id=u.id
    ) s ON TRUE
    CROSS JOIN LATERAL (SELECT COUNT(*) AS total_submissions FROM submissions) totals
    WHERE u.role='JUROR'
    ORDER BY COALESCE(p.sort_order,999),u.created_at ASC
  `);
  return rows;
}

export async function getJuryBoardSummary() {
  const { rows } = await pool.query(`
    WITH jurors AS (
      SELECT id,account_status FROM users WHERE role='JUROR'
    ), score_summary AS (
      SELECT
        COUNT(*) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE)::int AS submitted_scores,
        COUNT(*) FILTER (WHERE js.submitted=FALSE AND js.conflict_of_interest=FALSE)::int AS draft_scores,
        COUNT(*) FILTER (WHERE js.conflict_of_interest=TRUE)::int AS conflicts
      FROM jury_scores js JOIN jurors j ON j.id=js.juror_id
    ), disagreement AS (
      SELECT COUNT(*)::int AS high_disagreement
      FROM (
        SELECT submission_id
        FROM jury_scores
        WHERE submitted=TRUE AND conflict_of_interest=FALSE
        GROUP BY submission_id
        HAVING COUNT(*) >= 2 AND MAX(weighted_total)-MIN(weighted_total) >= 20
      ) q
    )
    SELECT
      (SELECT COUNT(*)::int FROM jurors) AS "totalJurors",
      (SELECT COUNT(*)::int FROM jurors WHERE account_status='ACTIVE') AS "activeJurors",
      (SELECT COUNT(*)::int FROM submissions) AS "totalSubmissions",
      COALESCE(score_summary.submitted_scores,0) AS "submittedScores",
      COALESCE(score_summary.draft_scores,0) AS "draftScores",
      COALESCE(score_summary.conflicts,0) AS "conflicts",
      disagreement.high_disagreement AS "highDisagreement"
    FROM score_summary,disagreement
  `);
  const summary = rows[0] || {};
  const possible = Number(summary.activeJurors || 0) * Number(summary.totalSubmissions || 0);
  summary.completionPercent = possible ? Math.round(Number(summary.submittedScores || 0) / possible * 1000) / 10 : 0;
  return summary;
}

export async function createJuror(input = {}) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const password = String(input.password || '');
  if (name.length < 2) throw new AppError('Tên giám khảo cần ít nhất 2 ký tự.',400);
  if (!email.includes('@')) throw new AppError('Email giám khảo không hợp lệ.',400);
  if (password.length < 8) throw new AppError('Mật khẩu cần ít nhất 8 ký tự.',400);
  const profile = normalizeProfile(input);
  const passwordHash = await bcrypt.hash(password,12);

  return withTransaction(async client => {
    const exists = await client.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)',[email]);
    if (exists.rowCount) throw new AppError('Email này đã được sử dụng.',409);
    const { rows } = await client.query(`
      INSERT INTO users(name,email,password_hash,role,account_status)
      VALUES ($1,$2,$3,'JUROR',$4)
      RETURNING id,name,email,role,account_status AS "accountStatus",created_at AS "createdAt"
    `,[name,email,passwordHash,input.accountStatus==='SUSPENDED'?'SUSPENDED':'ACTIVE']);
    const user = rows[0];
    await client.query(`
      INSERT INTO jury_profiles(juror_id,title,organization,phone,expertise,notes,sort_order,allowed_themes,allowed_types)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)
    `,[user.id,profile.title,profile.organization,profile.phone,profile.expertise,profile.notes,profile.sortOrder,JSON.stringify(profile.allowedThemes),JSON.stringify(profile.allowedTypes)]);
    return user;
  });
}

export async function updateJuror(id,input = {}) {
  const profile = normalizeProfile(input);
  return withTransaction(async client => {
    const current = (await client.query("SELECT * FROM users WHERE id=$1 AND role='JUROR'",[id])).rows[0];
    if (!current) throw new AppError('Không tìm thấy giám khảo.',404);
    const name = input.name !== undefined ? String(input.name).trim() : current.name;
    const email = input.email !== undefined ? String(input.email).trim().toLowerCase() : current.email;
    if (name.length < 2) throw new AppError('Tên giám khảo không hợp lệ.',400);
    if (!email.includes('@')) throw new AppError('Email giám khảo không hợp lệ.',400);
    const duplicate = await client.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1) AND id<>$2',[email,id]);
    if (duplicate.rowCount) throw new AppError('Email này đã được sử dụng.',409);
    const status = input.accountStatus === 'SUSPENDED' ? 'SUSPENDED' : (input.accountStatus === 'ACTIVE' ? 'ACTIVE' : current.account_status);
    const { rows } = await client.query(`
      UPDATE users SET name=$2,email=$3,account_status=$4,updated_at=NOW()
      WHERE id=$1 RETURNING id,name,email,role,account_status AS "accountStatus",last_login_at AS "lastLoginAt",updated_at AS "updatedAt"
    `,[id,name,email,status]);
    await client.query(`
      INSERT INTO jury_profiles(juror_id,title,organization,phone,expertise,notes,sort_order,allowed_themes,allowed_types,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,NOW())
      ON CONFLICT (juror_id) DO UPDATE SET
        title=EXCLUDED.title,organization=EXCLUDED.organization,phone=EXCLUDED.phone,
        expertise=EXCLUDED.expertise,notes=EXCLUDED.notes,sort_order=EXCLUDED.sort_order,
        allowed_themes=EXCLUDED.allowed_themes,allowed_types=EXCLUDED.allowed_types,updated_at=NOW()
    `,[id,profile.title,profile.organization,profile.phone,profile.expertise,profile.notes,profile.sortOrder,JSON.stringify(profile.allowedThemes),JSON.stringify(profile.allowedTypes)]);
    return rows[0];
  });
}

export async function resetJurorPassword(id,password) {
  const next = String(password || '');
  if (next.length < 8) throw new AppError('Mật khẩu mới cần ít nhất 8 ký tự.',400);
  const passwordHash = await bcrypt.hash(next,12);
  const { rows } = await pool.query(`
    UPDATE users SET password_hash=$2,updated_at=NOW()
    WHERE id=$1 AND role='JUROR'
    RETURNING id,name,email
  `,[id,passwordHash]);
  if (!rows[0]) throw new AppError('Không tìm thấy giám khảo.',404);
  return { ok:true, juror:rows[0] };
}

export async function deleteJuror(id) {
  const scoreCount = Number((await pool.query('SELECT COUNT(*)::int AS count FROM jury_scores WHERE juror_id=$1',[id])).rows[0]?.count || 0);
  if (scoreCount > 0) throw new AppError('Giám khảo đã có dữ liệu chấm. Hãy khóa tài khoản thay vì xóa.',409);
  const { rows } = await pool.query("DELETE FROM users WHERE id=$1 AND role='JUROR' RETURNING id,name,email",[id]);
  if (!rows[0]) throw new AppError('Không tìm thấy giám khảo.',404);
  return rows[0];
}

export { THEMES as juryThemes, TYPES as juryTypes };
