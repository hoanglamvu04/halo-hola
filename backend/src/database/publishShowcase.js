import { pool } from './pool.js';

async function main(){
  const result=await pool.query(
    "UPDATE submissions SET is_demo=FALSE, allow_media_use=TRUE, publication_state='PUBLISHED', published_at=COALESCE(published_at,NOW()), publish_scheduled_at=NULL, publication_updated_at=NOW(), updated_at=NOW() WHERE code LIKE 'HH26-SHOW%'"
  );
  console.log(`Public showcase enabled for ${result.rowCount||0} submissions.`);
  await pool.end();
}

main().catch(async error=>{
  console.error(error);
  await pool.end().catch(()=>{});
  process.exit(1);
});
