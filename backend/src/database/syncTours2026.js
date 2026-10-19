import { pool } from './pool.js';
import { HOLA_TOURS_2026, HOLA_TOUR_STORY_2026 } from '../data/tours2026.js';

const client=await pool.connect();

try{
  await client.query('BEGIN');

  for(const tour of HOLA_TOURS_2026){
    await client.query(
      `INSERT INTO tours
       (number,title,dates,kicker,description,image,status,capacity,itinerary,highlights,stops,location,duration_label,audience_label,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,'PUBLISHED',20,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12,$13)
       ON CONFLICT (number) DO UPDATE SET
         title=EXCLUDED.title,
         dates=EXCLUDED.dates,
         kicker=EXCLUDED.kicker,
         description=EXCLUDED.description,
         image=EXCLUDED.image,
         status='PUBLISHED',
         itinerary=EXCLUDED.itinerary,
         highlights=EXCLUDED.highlights,
         stops=EXCLUDED.stops,
         location=EXCLUDED.location,
         duration_label=EXCLUDED.duration_label,
         audience_label=EXCLUDED.audience_label,
         sort_order=EXCLUDED.sort_order,
         updated_at=NOW()`,
      [
        tour.number,
        tour.title,
        tour.dates,
        tour.kicker,
        tour.description,
        tour.image,
        JSON.stringify(tour.itinerary),
        JSON.stringify(tour.highlights),
        JSON.stringify(tour.stops),
        tour.location,
        tour.durationLabel,
        tour.audienceLabel,
        tour.sortOrder
      ]
    );
  }

  await client.query(
    `UPDATE stories
     SET body=$2::jsonb,
         excerpt=$3,
         updated_at=NOW()
     WHERE slug=$1`,
    ['hola-tour-di-nhin-gap-trai-nghiem-ke',JSON.stringify(HOLA_TOUR_STORY_2026.body),HOLA_TOUR_STORY_2026.excerpt]
  );

  await client.query(
    `UPDATE site_sections
     SET content=COALESCE(content,'{}'::jsonb) || $2::jsonb,
         updated_at=NOW()
     WHERE section_key=$1`,
    ['tours',JSON.stringify({
      eyebrow:'HÀNH TRÌNH SĂN CÂU CHUYỆN',
      description:'Ba hành trình HOLA Tour: Đi tìm Bản sắc · Đi tìm Màu sắc · Đi tìm Cảm xúc — tập trung tạo ra câu chuyện, nhân vật, ảnh, video và tư liệu cho hệ thống 52 góc nhìn.'
    })]
  );

  await client.query('COMMIT');
  console.log('HOLA Tour 2026 synchronized from one authoritative dataset.');
}catch(error){
  await client.query('ROLLBACK');
  throw error;
}finally{
  client.release();
  await pool.end();
}
