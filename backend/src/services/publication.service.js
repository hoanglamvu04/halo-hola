import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_ACTIONS=new Set(['PUBLISH','HIDE','SCHEDULE']);
const PUBLIC_ELIGIBLE_STATUSES=new Set(['VALID','SHORTLIST','TOP52','AWARDED']);
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function actorUuid(value){return uuidPattern.test(String(value||''))?value:null;}
function effectivePublicSql(alias='s'){
  return `(${alias}.publication_state='PUBLISHED' OR (${alias}.publication_state='SCHEDULED' AND ${alias}.publish_scheduled_at IS NOT NULL AND ${alias}.publish_scheduled_at<=NOW()))`;
}
function eligibility(item){
  const isDemo=item.is_demo??item.isDemo??false;
  const allowMediaUse=item.allow_media_use??item.allowMediaUse??false;
  const rightsConfirmed=item.rights_confirmed??item.rightsConfirmed??false;
  const imageConsentConfirmed=item.image_consent_confirmed??item.imageConsentConfirmed??false;
  const isMinor=item.is_minor??item.isMinor??false;
  const guardianConsent=item.guardian_consent??item.guardianConsent??false;
  const reasons=[];
  if(!PUBLIC_ELIGIBLE_STATUSES.has(item.status)) reasons.push('Bài dự thi chưa được BTC xác nhận đủ điều kiện công khai.');
  if(isDemo) reasons.push('Dữ liệu mẫu không được công bố public.');
  if(!allowMediaUse) reasons.push('Tác giả chưa cho phép sử dụng media.');
  if(!rightsConfirmed) reasons.push('Chưa xác nhận quyền tác giả.');
  if(!imageConsentConfirmed) reasons.push('Chưa xác nhận quyền hình ảnh.');
  if(isMinor&&!guardianConsent) reasons.push('Tác giả vị thành niên chưa có xác nhận người giám hộ.');
  return {eligible:reasons.length===0,reasons};
}
function mapRow(row){
  const gate=eligibility(row);
  return {...row,...gate,publicNow:Boolean(row.publicNow)};
}

export async function getPublicationOverview(){
  const {rows}=await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status IN ('VALID','SHORTLIST','TOP52','AWARDED') AND is_demo=FALSE AND allow_media_use=TRUE)::int AS eligible_status,
      COUNT(*) FILTER (WHERE ${effectivePublicSql('submissions')})::int AS public_now,
      COUNT(*) FILTER (WHERE publication_state='PUBLISHED')::int AS published,
      COUNT(*) FILTER (WHERE publication_state='SCHEDULED' AND publish_scheduled_at>NOW())::int AS scheduled,
      COUNT(*) FILTER (WHERE publication_state='HIDDEN')::int AS hidden,
      COUNT(*) FILTER (WHERE status IN ('VALID','SHORTLIST','TOP52','AWARDED') AND is_demo=FALSE AND allow_media_use=TRUE
        AND (rights_confirmed=FALSE OR image_consent_confirmed=FALSE OR (is_minor=TRUE AND guardian_consent=FALSE)))::int AS blocked_rights
    FROM submissions
  `);
  return rows[0]||{};
}

export async function listPublicationItems(filters={}){
  const values=[];
  const conditions=[];
  const q=String(filters.q||'').trim();
  if(q){
    values.push(`%${q}%`);const p=`$${values.length}`;
    conditions.push(`(s.code ILIKE ${p} OR COALESCE(s.title,'') ILIKE ${p} OR s.name ILIKE ${p} OR COALESCE(s.display_name,'') ILIKE ${p} OR s.theme ILIKE ${p})`);
  }
  if(filters.status){values.push(String(filters.status));conditions.push(`s.status=$${values.length}`);}
  if(filters.publicationState){values.push(String(filters.publicationState));conditions.push(`s.publication_state=$${values.length}`);}
  if(String(filters.eligibleOnly)==='true') conditions.push(`s.status IN ('VALID','SHORTLIST','TOP52','AWARDED') AND s.is_demo=FALSE AND s.allow_media_use=TRUE`);
  const limit=Math.max(1,Math.min(500,Number(filters.limit)||200));
  values.push(limit);const limitParam=values.length;
  const where=conditions.length?`WHERE ${conditions.join(' AND ')}`:'';
  const {rows}=await pool.query(`
    SELECT
      s.id,s.code,s.title,COALESCE(NULLIF(s.display_name,''),s.name) AS author,
      s.email,s.type,s.theme,s.color,s.location,s.status,s.is_demo AS "isDemo",
      s.submission_source AS "submissionSource",s.facebook_post_url AS "facebookPostUrl",
      s.allow_media_use AS "allowMediaUse",s.rights_confirmed AS "rightsConfirmed",
      s.image_consent_confirmed AS "imageConsentConfirmed",s.is_minor AS "isMinor",
      s.guardian_consent AS "guardianConsent",s.publication_state AS "publicationState",
      s.published_at AS "publishedAt",s.publish_scheduled_at AS "publishScheduledAt",
      s.publication_updated_at AS "publicationUpdatedAt",s.created_at AS "createdAt",
      ${effectivePublicSql('s')} AS "publicNow",
      COALESCE(sel.types,'[]'::json) AS "selectionTypes"
    FROM submissions s
    LEFT JOIN LATERAL (
      SELECT COALESCE(json_agg(js.selection_type ORDER BY js.selection_type),'[]'::json) AS types
      FROM jury_selections js
      WHERE js.submission_id=s.id
    ) sel ON TRUE
    ${where}
    ORDER BY
      CASE WHEN ${effectivePublicSql('s')} THEN 0 WHEN s.publication_state='SCHEDULED' THEN 1 ELSE 2 END,
      CASE s.status WHEN 'AWARDED' THEN 0 WHEN 'TOP52' THEN 1 WHEN 'SHORTLIST' THEN 2 WHEN 'VALID' THEN 3 ELSE 4 END,
      s.publication_updated_at DESC,s.created_at DESC
    LIMIT $${limitParam}
  `,values);
  return rows.map(mapRow);
}

async function applyAction(client,{submissionId,action,scheduledAt,reason,actorId}){
  if(!ALLOWED_ACTIONS.has(action)) throw new AppError('Thao tác công bố không hợp lệ.',400);
  const {rows}=await client.query(`SELECT * FROM submissions WHERE id=$1 FOR UPDATE`,[submissionId]);
  const item=rows[0];
  if(!item) throw new AppError('Không tìm thấy tác phẩm.',404);
  const gate=eligibility(item);
  if(action!=='HIDE'&&!gate.eligible) throw new AppError(gate.reasons.join(' '),400);

  let state='HIDDEN';let schedule=null;let publishedAt=item.published_at;
  if(action==='PUBLISH'){
    state='PUBLISHED';publishedAt=new Date();
  }else if(action==='SCHEDULE'){
    const when=new Date(scheduledAt||'');
    if(Number.isNaN(when.getTime())) throw new AppError('Thời gian hẹn công bố không hợp lệ.',400);
    if(when.getTime()<=Date.now()+30000) throw new AppError('Thời gian hẹn công bố phải ở tương lai.',400);
    state='SCHEDULED';schedule=when;publishedAt=null;
  }
  if(action==='HIDE') publishedAt=null;

  const before={publicationState:item.publication_state,publishedAt:item.published_at,publishScheduledAt:item.publish_scheduled_at};
  const updated=(await client.query(`
    UPDATE submissions
    SET publication_state=$2,published_at=$3,publish_scheduled_at=$4,publication_updated_at=NOW(),updated_at=NOW()
    WHERE id=$1
    RETURNING id,code,status,publication_state AS "publicationState",published_at AS "publishedAt",
              publish_scheduled_at AS "publishScheduledAt",publication_updated_at AS "publicationUpdatedAt"
  `,[submissionId,state,publishedAt,schedule])).rows[0];
  await client.query(`
    INSERT INTO submission_publication_logs(submission_id,actor_id,action,before_data,after_data,reason)
    VALUES($1,$2,$3,$4::jsonb,$5::jsonb,$6)
  `,[submissionId,actorUuid(actorId),action,JSON.stringify(before),JSON.stringify(updated),reason||null]);
  return updated;
}

export async function setPublicationState(payload){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const result=await applyAction(client,payload);
    await client.query('COMMIT');
    return result;
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function bulkSetPublicationState({ids=[],action,scheduledAt,reason,actorId}){
  const unique=[...new Set((Array.isArray(ids)?ids:[]).map(String))].slice(0,200);
  if(!unique.length) throw new AppError('Chưa chọn tác phẩm.',400);
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const results=[];
    for(const id of unique){results.push(await applyAction(client,{submissionId:id,action,scheduledAt,reason,actorId}));}
    await client.query('COMMIT');
    return {updated:results.length,items:results};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function listPublicationAudit(limit=100){
  const safe=Math.max(1,Math.min(300,Number(limit)||100));
  const {rows}=await pool.query(`
    SELECT l.id,l.submission_id AS "submissionId",l.action,l.before_data AS "beforeData",
           l.after_data AS "afterData",l.reason,l.created_at AS "createdAt",
           s.code,s.title,COALESCE(u.name,u.email,'Hệ thống') AS actor
    FROM submission_publication_logs l
    JOIN submissions s ON s.id=l.submission_id
    LEFT JOIN users u ON u.id=l.actor_id
    ORDER BY l.created_at DESC LIMIT $1
  `,[safe]);
  return rows;
}
