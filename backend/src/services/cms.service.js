import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import { createR2Client, deleteR2Object } from '../storage/r2.js';

const storyFields = [
  'slug','title','author','role','category','location','read_time','excerpt','lead','quote',
  'content','image','body','gallery','featured','published','sort_order'
];

function pick(source, fields) {
  return Object.fromEntries(fields.filter((key)=>source[key] !== undefined).map((key)=>[key,source[key]]));
}

function json(value, fallback=[]) {
  if (value === undefined) return undefined;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value ?? fallback;
}

function slugify(value='') {
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/đ/g,'d')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,200);
}

export async function listAdminStories() {
  const { rows } = await pool.query(
    `SELECT * FROM stories ORDER BY featured DESC, sort_order ASC, created_at DESC`
  );
  return rows;
}

export async function createAdminStory(input) {
  const data = pick(input, storyFields);
  const slug = slugify(data.slug || data.title || 'story');
  const body = json(data.body, []);
  const gallery = json(data.gallery, []);
  const { rows } = await pool.query(
    `INSERT INTO stories
      (slug,title,author,role,category,location,read_time,excerpt,lead,quote,content,image,body,gallery,featured,published,sort_order)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15,$16,$17)
     RETURNING *`,
    [
      slug,
      data.title || 'Story chưa đặt tên',
      data.author || 'HALO HOLA Editorial',
      data.role || null,
      data.category || null,
      data.location || 'Hòa Lạc',
      data.read_time || '5 phút đọc',
      data.excerpt || '',
      data.lead || '',
      data.quote || '',
      data.content || '',
      data.image || null,
      JSON.stringify(body || []),
      JSON.stringify(gallery || []),
      Boolean(data.featured),
      data.published !== false,
      Number(data.sort_order || 0)
    ]
  );
  return rows[0];
}

export async function updateAdminStory(id, input) {
  const current = (await pool.query('SELECT * FROM stories WHERE id=$1',[id])).rows[0];
  if (!current) return null;
  const data = pick(input, storyFields);
  const merged = { ...current, ...data };
  const body = json(merged.body, []);
  const gallery = json(merged.gallery, []);
  const slug = slugify(merged.slug || merged.title || current.slug);
  const { rows } = await pool.query(
    `UPDATE stories SET
      slug=$2,title=$3,author=$4,role=$5,category=$6,location=$7,read_time=$8,
      excerpt=$9,lead=$10,quote=$11,content=$12,image=$13,body=$14::jsonb,gallery=$15::jsonb,
      featured=$16,published=$17,sort_order=$18,updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [
      id,slug,merged.title,merged.author,merged.role,merged.category,merged.location,merged.read_time,
      merged.excerpt,merged.lead,merged.quote,merged.content,merged.image,
      JSON.stringify(body || []),JSON.stringify(gallery || []),
      Boolean(merged.featured),Boolean(merged.published),Number(merged.sort_order || 0)
    ]
  );
  return rows[0] || null;
}

export async function deleteAdminStory(id) {
  const { rows } = await pool.query('DELETE FROM stories WHERE id=$1 RETURNING id',[id]);
  return rows[0] || null;
}

export async function listAdminTours() {
  const { rows } = await pool.query('SELECT * FROM tours ORDER BY sort_order ASC, number ASC');
  return rows;
}

export async function createAdminTour(input) {
  const { rows } = await pool.query(
    `INSERT INTO tours
      (number,title,dates,kicker,description,image,status,capacity,itinerary,highlights,stops,location,duration_label,audience_label,sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,$15)
     RETURNING *`,
    [
      String(input.number || Date.now()),
      input.title || 'Tour mới',
      input.dates || '',
      input.kicker || '',
      input.description || '',
      input.image || null,
      input.status || 'DRAFT',
      Number(input.capacity || 20),
      JSON.stringify(json(input.itinerary,[]) || []),
      JSON.stringify(json(input.highlights,[]) || []),
      JSON.stringify(json(input.stops,[]) || []),
      input.location || 'Hòa Lạc, Hà Nội',
      input.duration_label || '2 ngày',
      input.audience_label || '15–20 người',
      Number(input.sort_order || 0)
    ]
  );
  return rows[0];
}

export async function updateAdminTour(id, input) {
  const current=(await pool.query('SELECT * FROM tours WHERE id=$1',[id])).rows[0];
  if(!current) return null;
  const v={...current,...input};
  const { rows }=await pool.query(
    `UPDATE tours SET
      number=$2,title=$3,dates=$4,kicker=$5,description=$6,image=$7,status=$8,capacity=$9,
      itinerary=$10::jsonb,highlights=$11::jsonb,stops=$12::jsonb,location=$13,
      duration_label=$14,audience_label=$15,sort_order=$16,updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [
      id,String(v.number),v.title,v.dates,v.kicker,v.description,v.image,v.status,Number(v.capacity||20),
      JSON.stringify(json(v.itinerary,[])||[]),JSON.stringify(json(v.highlights,[])||[]),JSON.stringify(json(v.stops,[])||[]),
      v.location,v.duration_label,v.audience_label,Number(v.sort_order||0)
    ]
  );
  return rows[0]||null;
}

export async function deleteAdminTour(id) {
  return (await pool.query('DELETE FROM tours WHERE id=$1 RETURNING id',[id])).rows[0]||null;
}

export async function listAdminPlaces() {
  const { rows } = await pool.query('SELECT * FROM places ORDER BY sort_order ASC, name ASC');
  return rows;
}

export async function createAdminPlace(input) {
  const { rows }=await pool.query(
    `INSERT INTO places (slug,name,category,lat,lng,image,description,published,tags,sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10) RETURNING *`,
    [
      slugify(input.slug||input.name||'place'),
      input.name||'Địa điểm mới',
      input.category||'Điểm đến',
      Number(input.lat||21.02),
      Number(input.lng||105.51),
      input.image||null,
      input.description||'',
      input.published!==false,
      JSON.stringify(json(input.tags,[])||[]),
      Number(input.sort_order||0)
    ]
  );
  return rows[0];
}

export async function updateAdminPlace(id,input) {
  const current=(await pool.query('SELECT * FROM places WHERE id=$1',[id])).rows[0];
  if(!current) return null;
  const v={...current,...input};
  const { rows }=await pool.query(
    `UPDATE places SET slug=$2,name=$3,category=$4,lat=$5,lng=$6,image=$7,description=$8,
      published=$9,tags=$10::jsonb,sort_order=$11,updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [
      id,slugify(v.slug||v.name),v.name,v.category,Number(v.lat),Number(v.lng),v.image,v.description,
      Boolean(v.published),JSON.stringify(json(v.tags,[])||[]),Number(v.sort_order||0)
    ]
  );
  return rows[0]||null;
}

export async function deleteAdminPlace(id) {
  return (await pool.query('DELETE FROM places WHERE id=$1 RETURNING id',[id])).rows[0]||null;
}

export async function listAdminPartners() {
  return (await pool.query('SELECT * FROM partners ORDER BY sort_order ASC, name ASC')).rows;
}

export async function createAdminPartner(input) {
  const { rows }=await pool.query(
    `INSERT INTO partners (name,tier,description,logo,website,published,sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      input.name||'Đối tác mới',input.tier||'PARTNER',input.description||'',input.logo||null,
      input.website||null,input.published!==false,Number(input.sort_order||0)
    ]
  );
  return rows[0];
}

export async function updateAdminPartner(id,input) {
  const current=(await pool.query('SELECT * FROM partners WHERE id=$1',[id])).rows[0];
  if(!current) return null;
  const v={...current,...input};
  const { rows }=await pool.query(
    `UPDATE partners SET name=$2,tier=$3,description=$4,logo=$5,website=$6,published=$7,
      sort_order=$8,updated_at=NOW() WHERE id=$1 RETURNING *`,
    [id,v.name,v.tier,v.description,v.logo,v.website,Boolean(v.published),Number(v.sort_order||0)]
  );
  return rows[0]||null;
}

export async function deleteAdminPartner(id) {
  return (await pool.query('DELETE FROM partners WHERE id=$1 RETURNING id',[id])).rows[0]||null;
}

export async function getSiteSettings() {
  const { rows }=await pool.query('SELECT setting_key,value,updated_at FROM site_settings ORDER BY setting_key');
  return Object.fromEntries(rows.map(r=>[r.setting_key,{...r.value,updatedAt:r.updated_at}]));
}

export async function updateSiteSetting(key,value) {
  const { rows }=await pool.query(
    `INSERT INTO site_settings (setting_key,value,updated_at) VALUES ($1,$2::jsonb,NOW())
     ON CONFLICT (setting_key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()
     RETURNING setting_key,value,updated_at`,
    [key,JSON.stringify(value||{})]
  );
  return rows[0];
}

export async function listMediaLibrary({ q, folder, sectionKey, archived=false }={}) {
  const where=['archived=$1'];
  const values=[Boolean(archived)];
  if(folder){values.push(folder);where.push(`folder=$${values.length}`);}
  if(sectionKey){values.push(sectionKey);where.push(`section_key=$${values.length}`);}
  if(q){
    values.push('%'+q+'%');
    where.push(`(original_name ILIKE $${values.length} OR COALESCE(title,'') ILIKE $${values.length} OR COALESCE(tags,'') ILIKE $${values.length})`);
  }
  const { rows }=await pool.query(
    `SELECT id,section_key,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,
            title,alt_text,folder,tags,archived,created_at
     FROM site_assets WHERE ${where.join(' AND ')}
     ORDER BY created_at DESC LIMIT 300`,
    values
  );
  const base=env.publicBaseUrl.replace(/\/$/,'');
  return rows.map(row=>({...row,url:`${base}/api/site-assets/${row.id}`}));
}

export async function updateMediaAsset(id,input) {
  const { rows }=await pool.query(
    `UPDATE site_assets SET
      title=COALESCE($2,title),alt_text=COALESCE($3,alt_text),folder=COALESCE($4,folder),
      tags=COALESCE($5,tags),archived=COALESCE($6,archived)
     WHERE id=$1 RETURNING *`,
    [
      id,
      input.title ?? null,
      input.alt_text ?? null,
      input.folder ?? null,
      input.tags ?? null,
      typeof input.archived==='boolean'?input.archived:null
    ]
  );
  const row=rows[0];
  if(!row) return null;
  return {...row,url:`${env.publicBaseUrl.replace(/\/$/,'')}/api/site-assets/${row.id}`};
}

export async function deleteMediaAsset(id) {
  const asset=(await pool.query('SELECT * FROM site_assets WHERE id=$1',[id])).rows[0];
  if(!asset) return null;
  if(asset.storage_provider==='R2'&&asset.bucket&&asset.object_key){
    await deleteR2Object({client:createR2Client(),bucket:asset.bucket,key:asset.object_key});
  }else if(asset.object_key){
    const localPath=path.join(process.cwd(),env.uploadDir,asset.object_key);
    await fsPromises.unlink(localPath).catch(()=>{});
  }
  await pool.query('DELETE FROM site_assets WHERE id=$1',[id]);
  return {id};
}
