import { pool } from './pool.js';

const MARK='[SHOWCASE_MEETING_V1]';

async function main(){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const found=await client.query("SELECT COUNT(*)::int AS count FROM submissions WHERE jury_note LIKE $1 OR code LIKE 'HH26-SHOW%'",[`${MARK}%`]);
    await client.query("DELETE FROM submissions WHERE jury_note LIKE $1 OR code LIKE 'HH26-SHOW%'",[`${MARK}%`]);
    await client.query('COMMIT');
    console.log(`Removed ${found.rows[0]?.count||0} meeting showcase submissions and dependent media/scores/selections.`);
  }catch(error){
    await client.query('ROLLBACK');
    throw error;
  }finally{
    client.release();
    await pool.end();
  }
}

main().catch(error=>{console.error(error);process.exit(1);});
