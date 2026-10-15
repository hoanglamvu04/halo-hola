import { Router } from 'express';
import { pool } from '../database/pool.js';

const router=Router();

function escapeXml(value=''){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&apos;');
}

router.get('/artworks.xml',async(_req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT LOWER(code) AS slug,COALESCE(publication_updated_at,published_at,updated_at,created_at) AS lastmod
      FROM submissions
      WHERE status IN ('VALID','SHORTLIST','TOP52','AWARDED')
        AND is_demo=FALSE
        AND allow_media_use=TRUE
        AND (
          publication_state='PUBLISHED'
          OR (publication_state='SCHEDULED' AND publish_scheduled_at IS NOT NULL AND publish_scheduled_at<=NOW())
        )
      ORDER BY COALESCE(publication_updated_at,published_at,updated_at,created_at) DESC
    `);
    const urls=rows.map(row=>{
      const lastmod=row.lastmod?new Date(row.lastmod).toISOString():new Date().toISOString();
      return `  <url><loc>https://halohola.vn/tac-pham/${escapeXml(row.slug)}</loc><lastmod>${escapeXml(lastmod)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }).join('\n');
    res.type('application/xml').set('Cache-Control','public, max-age=900').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
  }catch(error){next(error);}
});

export default router;
