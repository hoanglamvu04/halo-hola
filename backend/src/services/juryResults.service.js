import { pool } from '../database/pool.js';

const ROUND_CODE='PRELIMINARY';
const HIGH_VARIANCE_RANGE=20;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function actorUuid(value){return uuidPattern.test(String(value||''))?value:null;}
function number(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}

export async function getJuryRound(){
  const {rows}=await pool.query(`
    SELECT id,code,name,status,rules,locked_at AS "lockedAt",locked_reason AS "lockedReason",
           reopened_at AS "reopenedAt",reopened_reason AS "reopenedReason",updated_at AS "updatedAt"
    FROM jury_rounds WHERE code=$1 LIMIT 1
  `,[ROUND_CODE]);
  return rows[0]||null;
}

export async function listJuryResultsRanking(filters={}){
  const round=await getJuryRound();
  const values=[];
  const conditions=[`s.status <> 'REJECTED'`];
  const q=String(filters.q||'').trim();
  if(q){values.push(`%${q}%`);const p=`$${values.length}`;conditions.push(`(s.code ILIKE ${p} OR COALESCE(s.title,'') ILIKE ${p} OR s.name ILIKE ${p} OR COALESCE(s.display_name,'') ILIKE ${p})`);}
  if(filters.theme){values.push(String(filters.theme));conditions.push(`s.theme=$${values.length}`);}
  if(filters.type){values.push(String(filters.type));conditions.push(`s.type=$${values.length}`);}
  if(filters.status){values.push(String(filters.status));conditions.push(`s.status=$${values.length}`);}
  if(String(filters.includeDemo)==='false') conditions.push('s.is_demo=FALSE');
  if(filters.onlySelected){values.push(String(filters.onlySelected));conditions.push(`sel.types ? $${values.length}`);}
  const limit=Math.max(1,Math.min(1000,number(filters.limit,500)));
  const offset=Math.max(0,number(filters.offset,0));
  values.push(round?.id||null);const roundParam=values.length;
  values.push(limit);const limitParam=values.length;
  values.push(offset);const offsetParam=values.length;
  const sortMap={
    score_asc:'COALESCE(scores.avg_score,0) ASC, scores.score_count DESC, s.code ASC',
    ballots_desc:'scores.score_count DESC, COALESCE(scores.avg_score,0) DESC, s.code ASC',
    variance_desc:'COALESCE(scores.score_range,0) DESC, COALESCE(scores.avg_score,0) DESC, s.code ASC',
    code:'s.code ASC',
    newest:'s.created_at DESC',
    score_desc:'COALESCE(scores.avg_score,0) DESC, scores.score_count DESC, COALESCE(scores.score_range,0) ASC, s.code ASC'
  };
  const order=sortMap[filters.sort]||sortMap.score_desc;
  const {rows}=await pool.query(`
    SELECT
      s.id,s.code,s.title,COALESCE(NULLIF(s.display_name,''),s.name) AS author,
      s.type,s.theme,s.color,s.location,s.status,s.is_demo AS "isDemo",s.created_at AS "createdAt",
      COALESCE(scores.avg_score,0)::float AS "avgScore",
      COALESCE(scores.score_count,0)::int AS "scoreCount",
      COALESCE(scores.min_score,0)::float AS "minScore",
      COALESCE(scores.max_score,0)::float AS "maxScore",
      COALESCE(scores.score_range,0)::float AS "scoreRange",
      COALESCE(scores.stddev_score,0)::float AS "stddevScore",
      COALESCE(scores.draft_count,0)::int AS "draftCount",
      COALESCE(scores.coi_count,0)::int AS "coiCount",
      COALESCE(scores.top52_recommendations,0)::int AS "top52Recommendations",
      COALESCE(scores.award_recommendations,0)::int AS "awardRecommendations",
      COALESCE(assigned.assigned_count,0)::int AS "assignedCount",
      GREATEST(COALESCE(assigned.assigned_count,0)-COALESCE(scores.coi_count,0),0)::int AS "expectedCount",
      CASE WHEN GREATEST(COALESCE(assigned.assigned_count,0)-COALESCE(scores.coi_count,0),0)>0
        THEN LEAST(100,ROUND((COALESCE(scores.score_count,0)::numeric/GREATEST(COALESCE(assigned.assigned_count,0)-COALESCE(scores.coi_count,0),1))*100,1))::float
        ELSE 0 END AS "completionPercent",
      COALESCE(sel.types,'[]'::json) AS "selectionTypes",
      COUNT(*) OVER()::int AS "totalCount"
    FROM submissions s
    LEFT JOIN LATERAL (
      SELECT
        ROUND(AVG(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE),2) AS avg_score,
        COUNT(*) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE)::int AS score_count,
        MIN(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE) AS min_score,
        MAX(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE) AS max_score,
        (MAX(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE)-MIN(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE)) AS score_range,
        ROUND(STDDEV_POP(js.weighted_total) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE),2) AS stddev_score,
        COUNT(*) FILTER (WHERE js.submitted=FALSE AND js.conflict_of_interest=FALSE)::int AS draft_count,
        COUNT(*) FILTER (WHERE js.conflict_of_interest=TRUE)::int AS coi_count,
        COUNT(*) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE AND js.recommendation IN ('TOP52','AWARD'))::int AS top52_recommendations,
        COUNT(*) FILTER (WHERE js.submitted=TRUE AND js.conflict_of_interest=FALSE AND js.recommendation='AWARD')::int AS award_recommendations
      FROM jury_scores js WHERE js.submission_id=s.id
    ) scores ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS assigned_count
      FROM users u
      LEFT JOIN jury_profiles p ON p.juror_id=u.id
      WHERE u.role='JUROR' AND u.account_status='ACTIVE'
        AND (p.juror_id IS NULL OR jsonb_array_length(p.allowed_themes)=0 OR p.allowed_themes ? s.theme)
        AND (p.juror_id IS NULL OR jsonb_array_length(p.allowed_types)=0 OR p.allowed_types ? s.type)
    ) assigned ON TRUE
    LEFT JOIN LATERAL (
      SELECT COALESCE(json_agg(x.selection_type ORDER BY x.selection_type),'[]'::json) AS types
      FROM jury_selections x WHERE x.round_id=$${roundParam}::uuid AND x.submission_id=s.id
    ) sel ON TRUE
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${order}
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `,values);
  return rows;
}

export async function getJuryResultsOverview(){
  const [round,ranking,jurors,selectionRows]=await Promise.all([
    getJuryRound(),
    listJuryResultsRanking({limit:1000,sort:'score_desc'}),
    pool.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE account_status='ACTIVE')::int AS active FROM users WHERE role='JUROR'`),
    pool.query(`SELECT selection_type,COUNT(*)::int AS count FROM jury_selections WHERE round_id=(SELECT id FROM jury_rounds WHERE code=$1) GROUP BY selection_type`,[ROUND_CODE])
  ]);
  const selections=Object.fromEntries(selectionRows.rows.map(row=>[row.selection_type,row.count]));
  const scored=ranking.filter(x=>x.scoreCount>0);
  const fullScored=ranking.filter(x=>x.expectedCount>0&&x.scoreCount>=x.expectedCount).length;
  const finalizedBallots=ranking.reduce((sum,x)=>sum+x.scoreCount,0);
  const drafts=ranking.reduce((sum,x)=>sum+x.draftCount,0);
  const conflicts=ranking.reduce((sum,x)=>sum+x.coiCount,0);
  const pendingBallots=ranking.reduce((sum,x)=>sum+Math.max(0,x.expectedCount-x.scoreCount),0);
  const highVariance=ranking.filter(x=>x.scoreCount>=2&&x.scoreRange>=HIGH_VARIANCE_RANGE).length;
  const averageScore=scored.length?Math.round(scored.reduce((sum,x)=>sum+x.avgScore,0)/scored.length*100)/100:0;
  return {
    round,
    thresholds:{highVarianceRange:HIGH_VARIANCE_RANGE},
    counts:{
      submissions:ranking.length,scoredSubmissions:scored.length,fullyScoredSubmissions:fullScored,
      finalizedBallots,drafts,conflicts,pendingBallots,highVariance,averageScore,
      jurors:jurors.rows[0]?.total||0,activeJurors:jurors.rows[0]?.active||0,
      top52:selections.TOP52||0,reserves:selections.RESERVE||0
    }
  };
}

async function writeAudit(client,{roundId,actorId,action,entityType,entityId,beforeData,afterData,reason}){
  await client.query(`INSERT INTO jury_audit_logs(round_id,actor_id,action,entity_type,entity_id,before_data,after_data,reason)
    VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8)`,[
      roundId,actorUuid(actorId),action,entityType,entityId||null,
      beforeData===undefined?null:JSON.stringify(beforeData),afterData===undefined?null:JSON.stringify(afterData),reason||null
    ]);
}

export async function buildJurySelections({actorId,includeDemo=false,top52Limit=52,reserveLimit=8,reason=''}){
  const ranking=await listJuryResultsRanking({limit:1000,sort:'score_desc',includeDemo:includeDemo?'true':'false'});
  const eligible=ranking.filter(x=>['VALID','SHORTLIST','TOP52','AWARDED'].includes(x.status)&&x.scoreCount>0);
  const top52=eligible.slice(0,Math.max(1,Math.min(52,number(top52Limit,52))));
  const topIds=new Set(top52.map(x=>x.id));
  const reserves=eligible.filter(x=>!topIds.has(x.id)).slice(0,Math.max(0,Math.min(8,number(reserveLimit,8))));
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const round=(await client.query('SELECT id,status FROM jury_rounds WHERE code=$1 FOR UPDATE',[ROUND_CODE])).rows[0];
    if(!round) throw new Error('JURY_ROUND_NOT_FOUND');
    const before=(await client.query(`SELECT submission_id AS id,selection_type AS type,source FROM jury_selections WHERE round_id=$1 AND selection_type IN ('TOP52','RESERVE') ORDER BY selection_type,selected_at`,[round.id])).rows;
    await client.query(`DELETE FROM jury_selections WHERE round_id=$1 AND selection_type IN ('TOP52','RESERVE')`,[round.id]);
    for(const item of top52){await client.query(`INSERT INTO jury_selections(round_id,submission_id,selection_type,source,selected_by,note) VALUES($1,$2,'TOP52','AUTO',$3,$4)`,[round.id,item.id,actorUuid(actorId),reason||null]);}
    for(const item of reserves){await client.query(`INSERT INTO jury_selections(round_id,submission_id,selection_type,source,selected_by,note) VALUES($1,$2,'RESERVE','AUTO',$3,$4)`,[round.id,item.id,actorUuid(actorId),reason||null]);}
    const after={top52:top52.map(x=>x.id),reserves:reserves.map(x=>x.id),includeDemo:Boolean(includeDemo)};
    await writeAudit(client,{roundId:round.id,actorId,action:'AUTO_BUILD_SELECTIONS',entityType:'jury_selections',beforeData:before,afterData:after,reason});
    await client.query('COMMIT');
    return {top52,reserves,eligibleCount:eligible.length};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function setJurySelection({actorId,submissionId,selectionType,selected=true,note=''}){
  const allowed=['TOP52','RESERVE','TOP3_THEME','THEME_WINNER','COLOR_WINNER','TITLE_FINALIST'];
  if(!allowed.includes(selectionType)) throw new Error('INVALID_SELECTION_TYPE');
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const round=(await client.query('SELECT id FROM jury_rounds WHERE code=$1',[ROUND_CODE])).rows[0];
    const before=(await client.query('SELECT selection_type,source,note,selected_at FROM jury_selections WHERE round_id=$1 AND submission_id=$2 AND selection_type=$3',[round.id,submissionId,selectionType])).rows[0]||null;
    let after=null;
    if(selected){
      after=(await client.query(`INSERT INTO jury_selections(round_id,submission_id,selection_type,source,note,selected_by,selected_at)
        VALUES($1,$2,$3,'MANUAL',$4,$5,NOW())
        ON CONFLICT(round_id,submission_id,selection_type) DO UPDATE SET source='MANUAL',note=EXCLUDED.note,selected_by=EXCLUDED.selected_by,selected_at=NOW()
        RETURNING selection_type,source,note,selected_at`,[round.id,submissionId,selectionType,note||null,actorUuid(actorId)])).rows[0];
    }else{
      await client.query('DELETE FROM jury_selections WHERE round_id=$1 AND submission_id=$2 AND selection_type=$3',[round.id,submissionId,selectionType]);
    }
    await writeAudit(client,{roundId:round.id,actorId,action:selected?'SET_SELECTION':'REMOVE_SELECTION',entityType:'submission',entityId:submissionId,beforeData:before,afterData:after,reason:note});
    await client.query('COMMIT');
    return {selected,selectionType,submissionId};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function setJuryRoundStatus({actorId,status,reason=''}){
  if(!['OPEN','LOCKED'].includes(status)) throw new Error('INVALID_ROUND_STATUS');
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const before=(await client.query('SELECT * FROM jury_rounds WHERE code=$1 FOR UPDATE',[ROUND_CODE])).rows[0];
    if(!before) throw new Error('JURY_ROUND_NOT_FOUND');
    const actor=actorUuid(actorId);
    const {rows}=status==='LOCKED'
      ? await client.query(`UPDATE jury_rounds SET status='LOCKED',locked_at=NOW(),locked_by=$2,locked_reason=$3,updated_at=NOW() WHERE code=$1 RETURNING *`,[ROUND_CODE,actor,reason||null])
      : await client.query(`UPDATE jury_rounds SET status='OPEN',reopened_at=NOW(),reopened_by=$2,reopened_reason=$3,updated_at=NOW() WHERE code=$1 RETURNING *`,[ROUND_CODE,actor,reason||null]);
    const after=rows[0];
    await writeAudit(client,{roundId:after.id,actorId,action:status==='LOCKED'?'LOCK_ROUND':'REOPEN_ROUND',entityType:'jury_round',entityId:after.id,beforeData:{status:before.status},afterData:{status:after.status},reason});
    await client.query('COMMIT');
    return getJuryRound();
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function publishTop52Selection({actorId,reason=''}){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const round=(await client.query('SELECT id FROM jury_rounds WHERE code=$1',[ROUND_CODE])).rows[0];
    const selected=(await client.query(`SELECT submission_id FROM jury_selections WHERE round_id=$1 AND selection_type='TOP52'`,[round.id])).rows.map(x=>x.submission_id);
    if(!selected.length) throw new Error('NO_TOP52_SELECTION');
    const before=(await client.query(`SELECT id,code,status FROM submissions WHERE status='TOP52' OR id=ANY($1::uuid[])`,[selected])).rows;
    await client.query(`UPDATE submissions SET status='SHORTLIST',updated_at=NOW() WHERE status='TOP52' AND NOT(id=ANY($1::uuid[]))`,[selected]);
    await client.query(`UPDATE submissions SET status='TOP52',updated_at=NOW() WHERE id=ANY($1::uuid[]) AND status<>'AWARDED'`,[selected]);
    const after=(await client.query(`SELECT id,code,status FROM submissions WHERE id=ANY($1::uuid[])`,[selected])).rows;
    await writeAudit(client,{roundId:round.id,actorId,action:'PUBLISH_TOP52_STATUS',entityType:'submissions',beforeData:before,afterData:after,reason});
    await client.query('COMMIT');
    return {updated:selected.length,items:after};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function listJuryAudit(limit=80){
  const safe=Math.max(1,Math.min(300,number(limit,80)));
  const {rows}=await pool.query(`
    SELECT l.id,l.action,l.entity_type AS "entityType",l.entity_id AS "entityId",l.before_data AS "beforeData",l.after_data AS "afterData",l.reason,l.created_at AS "createdAt",
           COALESCE(u.name,u.email,'Hệ thống') AS actor
    FROM jury_audit_logs l LEFT JOIN users u ON u.id=l.actor_id
    WHERE l.round_id=(SELECT id FROM jury_rounds WHERE code=$1)
    ORDER BY l.created_at DESC LIMIT $2
  `,[ROUND_CODE,safe]);
  return rows;
}
