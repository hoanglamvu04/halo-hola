import { pool } from './pool.js';

const MARK='[SHOWCASE_MEETING_V1]';
const HASH='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

function clamp(value){return Math.max(0,Math.min(10,value));}
function round(value){return Math.round(value*100)/100;}

async function main(){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const juror=(await client.query(`
      INSERT INTO users(name,email,password_hash,role,account_status,created_at,updated_at)
      VALUES('Showcase scoring','showcase-scoring@halohola.invalid',$1,'EDITOR','SUSPENDED',NOW(),NOW())
      ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,role='EDITOR',account_status='SUSPENDED',updated_at=NOW()
      RETURNING id
    `,[HASH])).rows[0].id;
    const roundId=(await client.query(`
      INSERT INTO jury_rounds(code,name,status,created_at,updated_at)
      VALUES('PRELIMINARY','Chấm sơ khảo / TOP52','OPEN',NOW(),NOW())
      ON CONFLICT(code) DO UPDATE SET updated_at=NOW()
      RETURNING id
    `)).rows[0].id;
    const submissions=(await client.query(`
      SELECT id,code,status,row_number() OVER(ORDER BY code) AS rn
      FROM submissions
      WHERE code LIKE 'HH26-SHOW%'
      ORDER BY code
    `)).rows;
    for(const item of submissions){
      const i=Number(item.rn)-1;
      const quality=round(clamp(7.65+(i%8)*0.18));
      const representation=round(clamp(7.8+((i+3)%7)*0.17));
      const story=round(clamp(7.5+((i+5)%9)*0.15));
      const creativity=round(clamp(7.55+((i+2)%8)*0.16));
      const total=round(quality*3+representation*3+story*2+creativity*2);
      await client.query(`
        INSERT INTO jury_scores
          (submission_id,juror_id,quality,representation,story,creativity,weighted_total,recommendation,
           conflict_of_interest,note,submitted,submitted_at,created_at,updated_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,FALSE,$9,TRUE,NOW(),NOW(),NOW())
        ON CONFLICT(submission_id,juror_id) DO UPDATE SET
          quality=EXCLUDED.quality,representation=EXCLUDED.representation,story=EXCLUDED.story,
          creativity=EXCLUDED.creativity,weighted_total=EXCLUDED.weighted_total,recommendation=EXCLUDED.recommendation,
          note=EXCLUDED.note,submitted=TRUE,submitted_at=NOW(),updated_at=NOW()
      `,[item.id,juror,quality,representation,story,creativity,total,item.status==='AWARDED'?'AWARD':'TOP52',`${MARK} điểm trình diễn`]);
      await client.query(`
        INSERT INTO jury_selections(round_id,submission_id,selection_type,source,note,selected_at)
        VALUES($1,$2,'TOP52','AUTO',$3,NOW())
        ON CONFLICT(round_id,submission_id,selection_type) DO UPDATE SET source='AUTO',note=EXCLUDED.note,selected_at=NOW()
      `,[roundId,item.id,`${MARK} TOP52 trình diễn`]);
    }
    await client.query('COMMIT');
    console.log(`Showcase scoring complete: ${submissions.length} scorecards and TOP52 selections.`);
  }catch(error){
    await client.query('ROLLBACK');
    throw error;
  }finally{
    client.release();
    await pool.end();
  }
}

main().catch(error=>{console.error(error);process.exit(1);});
