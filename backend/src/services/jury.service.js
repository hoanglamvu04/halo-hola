import { pool } from '../database/pool.js';

const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jurorUuid(value){
  return uuidPattern.test(String(value||''))?value:null;
}

function clampScore(value){
  const number=Number(value);
  if(!Number.isFinite(number)) return 0;
  return Math.min(10,Math.max(0,Math.round(number*100)/100));
}

export function calculateWeightedScore(input={}){
  const quality=clampScore(input.quality);
  const representation=clampScore(input.representation);
  const story=clampScore(input.story);
  const creativity=clampScore(input.creativity);
  return Math.round((quality*3+representation*3+story*2+creativity*2)*100)/100;
}

function add(values,conditions,sql,value){
  values.push(value);
  conditions.push(sql.replace('?',`$${values.length}`));
}

export async function listJurySubmissions({jurorId,filters={}}={}){
  const currentJuror=jurorUuid(jurorId);
  const values=[currentJuror];
  const conditions=[];
  const q=String(filters.q||'').trim();

  if(q){
    values.push(`%${q}%`);
    const p=`$${values.length}`;
    conditions.push(`(s.code ILIKE ${p} OR s.title ILIKE ${p} OR s.name ILIKE ${p} OR s.email ILIKE ${p} OR s.location ILIKE ${p})`);
  }
  if(filters.status) add(values,conditions,'s.status = ?',filters.status);
  if(filters.type) add(values,conditions,'s.type = ?',filters.type);
  if(filters.theme) add(values,conditions,'s.theme = ?',filters.theme);
  if(filters.color) add(values,conditions,'s.color = ?',filters.color);
  if(filters.location) add(values,conditions,'s.location ILIKE ?',`%${filters.location}%`);

  if(filters.review==='unscored') conditions.push('mine.id IS NULL');
  if(filters.review==='draft') conditions.push('mine.id IS NOT NULL AND mine.submitted = FALSE AND mine.conflict_of_interest = FALSE');
  if(filters.review==='scored') conditions.push('mine.submitted = TRUE AND mine.conflict_of_interest = FALSE');
  if(filters.review==='conflict') conditions.push('mine.conflict_of_interest = TRUE');
  if(filters.recommendation) add(values,conditions,'mine.recommendation = ?',filters.recommendation);

  if(filters.rights==='complete') conditions.push(`s.rights_confirmed=TRUE AND s.image_consent_confirmed=TRUE AND (s.is_minor=FALSE OR s.guardian_consent=TRUE)`);
  if(filters.rights==='incomplete') conditions.push(`NOT (s.rights_confirmed=TRUE AND s.image_consent_confirmed=TRUE AND (s.is_minor=FALSE OR s.guardian_consent=TRUE))`);
  if(filters.hasMedia==='true') conditions.push('media.media_count > 0');
  if(filters.hasMedia==='false') conditions.push('media.media_count = 0');

  if(filters.minScore!==undefined&&filters.minScore!=='') add(values,conditions,'agg.avg_score >= ?',Number(filters.minScore));
  if(filters.maxScore!==undefined&&filters.maxScore!=='') add(values,conditions,'agg.avg_score <= ?',Number(filters.maxScore));

  const where=conditions.length?'WHERE '+conditions.join(' AND '):'';
  const orderMap={
    newest:'s.created_at DESC',
    oldest:'s.created_at ASC',
    score_desc:'agg.avg_score DESC NULLS LAST, s.created_at DESC',
    score_asc:'agg.avg_score ASC NULLS LAST, s.created_at DESC',
    code:'s.code ASC'
  };
  const order=orderMap[filters.sort]||orderMap.newest;

  const {rows}=await pool.query(`
    SELECT s.*,
      media.media,
      media.media_count,
      COALESCE(agg.avg_score,0)::float AS avg_score,
      COALESCE(agg.score_count,0)::int AS score_count,
      COALESCE(agg.min_score,0)::float AS min_score,
      COALESCE(agg.max_score,0)::float AS max_score,
      CASE WHEN mine.id IS NULL THEN NULL ELSE json_build_object(
        'id',mine.id,
        'quality',mine.quality::float,
        'representation',mine.representation::float,
        'story',mine.story::float,
        'creativity',mine.creativity::float,
        'weightedTotal',mine.weighted_total::float,
        'recommendation',mine.recommendation,
        'conflictOfInterest',mine.conflict_of_interest,
        'note',mine.note,
        'submitted',mine.submitted,
        'updatedAt',mine.updated_at
      ) END AS my_score
    FROM submissions s
    LEFT JOIN jury_scores mine ON mine.submission_id=s.id AND mine.juror_id=$1::uuid
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::int AS media_count,
        COALESCE(json_agg(json_build_object(
          'id',m.id,
          'url',m.url,
          'originalName',m.original_name,
          'mimeType',m.mime_type,
          'size',m.size_bytes,
          'provider',m.storage_provider,
          'bucket',m.bucket,
          'objectKey',m.object_key,
          'sha256',m.sha256,
          'revision',m.revision
        ) ORDER BY m.created_at ASC),'[]'::json) AS media
      FROM submission_media m WHERE m.submission_id=s.id
    ) media ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        ROUND(AVG(js.weighted_total),2) AS avg_score,
        COUNT(*)::int AS score_count,
        MIN(js.weighted_total) AS min_score,
        MAX(js.weighted_total) AS max_score
      FROM jury_scores js
      WHERE js.submission_id=s.id AND js.submitted=TRUE AND js.conflict_of_interest=FALSE
    ) agg ON TRUE
    ${where}
    ORDER BY ${order}
    LIMIT 500
  `,values);
  return rows;
}

export async function getJuryScorecard(submissionId,jurorId){
  const currentJuror=jurorUuid(jurorId);
  const mine=currentJuror?(await pool.query(
    `SELECT id,quality::float,representation::float,story::float,creativity::float,
      weighted_total::float AS "weightedTotal",recommendation,
      conflict_of_interest AS "conflictOfInterest",note,submitted,
      submitted_at AS "submittedAt",updated_at AS "updatedAt"
     FROM jury_scores WHERE submission_id=$1 AND juror_id=$2`,
    [submissionId,currentJuror]
  )).rows[0]||null:null;

  const judges=(await pool.query(
    `SELECT js.id,u.id AS "jurorId",u.name,u.email,
      js.quality::float,js.representation::float,js.story::float,js.creativity::float,
      js.weighted_total::float AS "weightedTotal",js.recommendation,
      js.conflict_of_interest AS "conflictOfInterest",js.submitted,js.updated_at AS "updatedAt"
     FROM jury_scores js JOIN users u ON u.id=js.juror_id
     WHERE js.submission_id=$1
     ORDER BY js.submitted DESC,js.weighted_total DESC,u.name ASC`,
    [submissionId]
  )).rows;

  const valid=judges.filter(x=>x.submitted&&!x.conflictOfInterest);
  const average=valid.length?Math.round(valid.reduce((sum,x)=>sum+x.weightedTotal,0)/valid.length*100)/100:null;
  return {mine,judges,aggregate:{average,count:valid.length,min:valid.length?Math.min(...valid.map(x=>x.weightedTotal)):null,max:valid.length?Math.max(...valid.map(x=>x.weightedTotal)):null}};
}

export async function saveJuryScore({submissionId,jurorId,input}){
  const currentJuror=jurorUuid(jurorId);
  if(!currentJuror) throw new Error('JUROR_ACCOUNT_REQUIRED');

  const {rows:roundRows}=await pool.query(`SELECT status FROM jury_rounds WHERE code='PRELIMINARY' LIMIT 1`);
  if(roundRows[0]?.status==='LOCKED') throw new Error('JURY_ROUND_LOCKED');

  const quality=clampScore(input.quality);
  const representation=clampScore(input.representation);
  const story=clampScore(input.story);
  const creativity=clampScore(input.creativity);
  const weighted=calculateWeightedScore({quality,representation,story,creativity});
  const recommendations=['NONE','SHORTLIST','TOP52','RESERVE','AWARD'];
  const recommendation=recommendations.includes(input.recommendation)?input.recommendation:'NONE';
  const conflict=Boolean(input.conflictOfInterest);
  const submitted=Boolean(input.submitted)&&!conflict;

  const {rows}=await pool.query(`
    INSERT INTO jury_scores
      (submission_id,juror_id,quality,representation,story,creativity,weighted_total,recommendation,conflict_of_interest,note,submitted,submitted_at,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CASE WHEN $11 THEN NOW() ELSE NULL END,NOW())
    ON CONFLICT (submission_id,juror_id) DO UPDATE SET
      quality=EXCLUDED.quality,
      representation=EXCLUDED.representation,
      story=EXCLUDED.story,
      creativity=EXCLUDED.creativity,
      weighted_total=EXCLUDED.weighted_total,
      recommendation=EXCLUDED.recommendation,
      conflict_of_interest=EXCLUDED.conflict_of_interest,
      note=EXCLUDED.note,
      submitted=EXCLUDED.submitted,
      submitted_at=CASE WHEN EXCLUDED.submitted THEN COALESCE(jury_scores.submitted_at,NOW()) ELSE NULL END,
      updated_at=NOW()
    RETURNING id,quality::float,representation::float,story::float,creativity::float,
      weighted_total::float AS "weightedTotal",recommendation,
      conflict_of_interest AS "conflictOfInterest",note,submitted,
      submitted_at AS "submittedAt",updated_at AS "updatedAt"
  `,[submissionId,currentJuror,quality,representation,story,creativity,weighted,recommendation,conflict,input.note||'',submitted]);
  return rows[0];
}

export async function getJuryStats(jurorId){
  const currentJuror=jurorUuid(jurorId);
  const {rows}=await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE s.status='PENDING')::int AS pending,
      COUNT(*) FILTER (WHERE s.status='VALID')::int AS valid,
      COUNT(*) FILTER (WHERE s.status='SHORTLIST')::int AS shortlist,
      COUNT(*) FILTER (WHERE s.status IN ('TOP52','AWARDED'))::int AS top52,
      COUNT(mine.id) FILTER (WHERE mine.submitted=TRUE AND mine.conflict_of_interest=FALSE)::int AS my_scored,
      COUNT(mine.id) FILTER (WHERE mine.conflict_of_interest=TRUE)::int AS my_conflicts,
      COUNT(*) FILTER (WHERE mine.id IS NULL)::int AS my_unscored
    FROM submissions s
    LEFT JOIN jury_scores mine ON mine.submission_id=s.id AND mine.juror_id=$1::uuid
  `,[currentJuror]);
  return rows[0]||{};
}
