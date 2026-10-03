import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import {
  createR2Client,
  getR2Buckets,
  putR2Object,
  createDownloadUrl
} from '../storage/r2.js';

function safeName(name='image') {
  const ext=path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g,'');
  const base=path.basename(name,path.extname(name))
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9-_]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,90) || 'image';
  return base+ext;
}

function hasR2Public() {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_PUBLIC
  );
}

export async function getHomepageSections() {
  const { rows } = await pool.query(
    'SELECT section_key,label,enabled,sort_order,content,updated_at FROM site_sections ORDER BY sort_order ASC'
  );
  return rows;
}

export async function getHomepagePublicObject() {
  const rows=await getHomepageSections();
  return Object.fromEntries(rows.map((row)=>[
    row.section_key,
    {
      label:row.label,
      enabled:row.enabled,
      sortOrder:row.sort_order,
      content:row.content || {},
      updatedAt:row.updated_at
    }
  ]));
}

export async function updateHomepageSection(sectionKey,{ enabled, content }) {
  const { rows } = await pool.query(
    `UPDATE site_sections
     SET enabled=COALESCE($2,enabled),
         content=COALESCE($3::jsonb,content),
         updated_at=NOW()
     WHERE section_key=$1
     RETURNING section_key,label,enabled,sort_order,content,updated_at`,
    [sectionKey, typeof enabled === 'boolean' ? enabled : null, content ? JSON.stringify(content) : null]
  );
  return rows[0] || null;
}

export async function listSiteAssets(sectionKey) {
  const values=[];
  let where='';
  if(sectionKey){
    values.push(sectionKey);
    where='WHERE section_key=$1';
  }
  const { rows }=await pool.query(
    `SELECT id,section_key,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,created_at
     FROM site_assets ${where} ORDER BY created_at DESC LIMIT 200`,
    values
  );
  return rows.map((row)=>({
    ...row,
    url:`${env.publicBaseUrl.replace(/\/$/,'')}/api/site-assets/${row.id}`
  }));
}

export async function saveSiteAsset({ sectionKey, file }) {
  if(!file?.path) throw new Error('Missing uploaded file');
  const useR2=hasR2Public();
  let provider='LOCAL';
  let bucket=null;
  let objectKey=file.filename;

  if(useR2){
    const client=createR2Client();
    const buckets=getR2Buckets();
    bucket=buckets.public;
    objectKey=`2026/site/homepage/${sectionKey || 'general'}/${Date.now()}-${safeName(file.originalname)}`;
    await putR2Object({
      client,
      bucket,
      key:objectKey,
      body:fs.createReadStream(file.path),
      contentType:file.mimetype,
      metadata:{
        section:sectionKey || 'general',
        originalname:encodeURIComponent(file.originalname)
      }
    });
    provider='R2';
    await fsPromises.unlink(file.path).catch(()=>{});
  }

  const { rows }=await pool.query(
    `INSERT INTO site_assets
     (section_key,original_name,mime_type,size_bytes,storage_provider,bucket,object_key)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      sectionKey || null,
      file.originalname,
      file.mimetype,
      file.size,
      provider,
      bucket,
      objectKey
    ]
  );

  const row=rows[0];
  return {
    ...row,
    url:`${env.publicBaseUrl.replace(/\/$/,'')}/api/site-assets/${row.id}`
  };
}

export async function resolveSiteAsset(id) {
  const { rows }=await pool.query(
    'SELECT * FROM site_assets WHERE id=$1',
    [id]
  );
  const asset=rows[0];
  if(!asset) return null;

  if(asset.storage_provider==='R2' && asset.bucket && asset.object_key){
    const url=await createDownloadUrl({
      client:createR2Client(),
      bucket:asset.bucket,
      key:asset.object_key,
      expiresIn:3600
    });
    return { type:'redirect', url };
  }

  return {
    type:'redirect',
    url:`${env.publicBaseUrl.replace(/\/$/,'')}/uploads/${asset.object_key}`
  };
}
