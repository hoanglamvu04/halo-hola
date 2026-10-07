import { pool } from './pool.js';

async function main(){
  const { rowCount }=await pool.query(`
    UPDATE submissions
    SET captured_at = DATE '2026-09-18' + (((substring(code from 'SHOW([0-9]+)'))::int - 1) % 19),
        updated_at = NOW()
    WHERE code ~ '^HH26-SHOW[0-9]+$'
  `);
  console.log(`Normalized captured dates for ${rowCount} showcase submissions.`);
  await pool.end();
}

main().catch(async error=>{
  console.error(error);
  await pool.end().catch(()=>{});
  process.exit(1);
});
