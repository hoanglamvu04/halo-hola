import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { pool } from '../database/pool.js';
import { createDownloadUrl, createR2Client, getR2Buckets, putR2Object } from '../storage/r2.js';

const WIDTHS=[480,960,1600];
const FORMATS=['avif','webp'];

function parseVariant(file){
  const name=String(file?.originalname||'').toLowerCase();
  const match=/^variant-(\d{1,2})-(480|960|1600)\.(webp|avif)$/.exec(name);
  if(!match)return null;
  return {index:Number(match[1]),width:Number(match[2]),format:match[3]};
}

function hasPublicR2(){
  return Boolean(
    process.env.R2_ENDPOINT&&process.env.R2_ACCESS_KEY_ID&&process.env.R2_SECRET_ACCESS_KEY&&process.env.R2_BUCKET_PUBLIC
  );
}

export async function storeSubmissionMediaVariants(submission,variantFiles=[]){
  const files=Array.isArray(variantFiles)?variantFiles:[];
  if(!files.length)return {stored:0,skipped:0};
  const media=Array.isArray(submission?.media)?submission.media:[];
  const r2=hasPublicR2()?createR2Client():null;
  const buckets=r2?getR2Buckets():null;
  let stored=0;
  let skipped=0;

  for(const file of files){
    try{
      const meta=parseVariant(file);
      const parent=meta?media[meta.index]:null;
      if(!meta||!parent||!WIDTHS.includes(meta.width)||!FORMATS.includes(meta.format)||!r2){
        skipped+=1;
        continue;
      }
      const mimeType=meta.format==='avif'?'image/avif':'image/webp';
      const key=`2026/submissions/${submission.code}/public/v1/${parent.id}/${meta.width}.${meta.format}`;
      await putR2Object({
        client:r2,
        bucket:buckets.public,
        key,
        body:fsSync.createReadStream(file.path),
        contentType:mimeType,
        metadata:{submission:submission.code,media:String(parent.id),width:String(meta.width),format:meta.format}
      });
      await pool.query(
        `INSERT INTO submission_media_variants(media_id,width,format,mime_type,size_bytes,storage_provider,bucket,object_key)
         VALUES($1,$2,$3,$4,$5,'R2',$6,$7)
         ON CONFLICT(media_id,width,format) DO UPDATE SET
           mime_type=EXCLUDED.mime_type,size_bytes=EXCLUDED.size_bytes,storage_provider='R2',bucket=EXCLUDED.bucket,object_key=EXCLUDED.object_key,created_at=NOW()`,
        [parent.id,meta.width,meta.format,mimeType,Number(file.size||0),buckets.public,key]
      );
      stored+=1;
    }catch(error){
      skipped+=1;
      console.warn('Optimized media variant skipped:',error.message);
    }finally{
      if(file?.path)await fs.unlink(file.path).catch(()=>{});
    }
  }
  return {stored,skipped};
}

export async function getOptimizedMediaUrl(mediaId,{width=960,format='auto'}={}){
  const requestedWidth=WIDTHS.reduce((best,current)=>Math.abs(current-Number(width||960))<Math.abs(best-Number(width||960))?current:best,960);
  const requestedFormat=FORMATS.includes(String(format).toLowerCase())?String(format).toLowerCase():'auto';
  const order=requestedFormat==='auto'?['avif','webp']:[requestedFormat,...FORMATS.filter(x=>x!==requestedFormat)];
  const {rows}=await pool.query(
    `SELECT id,media_id,width,format,mime_type,bucket,object_key
     FROM submission_media_variants
     WHERE media_id=$1 AND width=$2 AND format=ANY($3::text[])
     ORDER BY array_position($3::text[],format) ASC
     LIMIT 1`,
    [mediaId,requestedWidth,order]
  );
  const variant=rows[0];
  if(!variant?.bucket||!variant?.object_key)return null;
  return {
    ...variant,
    url:await createDownloadUrl({client:createR2Client(),bucket:variant.bucket,key:variant.object_key,expiresIn:900})
  };
}

export function publicVariantPath(mediaId,width=960,format='auto'){
  return `/api/public-media/${encodeURIComponent(String(mediaId))}?w=${Number(width)||960}&format=${encodeURIComponent(format)}`;
}
