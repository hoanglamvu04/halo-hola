import { pool } from './pool.js';

const places = [
  ['ho-dong-mo', 'Hồ Đồng Mô', 'Thiên nhiên', 21.051, 105.445, 'Mặt nước rộng, đồi xanh và những khoảng trời phía Tây.'],
  ['khu-cong-nghe-cao-hoa-lac', 'Khu Công nghệ cao Hòa Lạc', 'Kiến trúc', 21.012, 105.525, 'Không gian công nghệ và đổi mới sáng tạo.'],
  ['dhqg-ha-noi', 'Đại học Quốc gia Hà Nội', 'Tri thức', 21.037, 105.527, 'Không gian học tập, tri thức và tuổi trẻ.'],
  ['thach-hoa', 'Thạch Hòa', 'Văn hóa', 21.03, 105.56, 'Làng xóm, đời sống và những dấu vết Xứ Đoài.'],
  ['ha-bang', 'Hạ Bằng', 'Con người', 20.999, 105.535, 'Nhịp sống địa phương và những câu chuyện bình dị.']
];

const tours = [
  ['01', 'Đoài – Mường', '17–18.10.2026', 'Đi tìm bản sắc', 'Làng xóm · kiến trúc · con người · Nét Đoài · văn hóa Mường · ký ức.'],
  ['02', 'Sắc màu Hòa Lạc', '24–25.10.2026', 'Đi tìm màu sắc', 'Tìm 6 sắc màu qua cảnh quan, kiến trúc, con người, công nghệ và đời sống.'],
  ['03', 'Nắng Hòa Lạc', '31.10–01.11.2026', 'Đi tìm cảm xúc', 'Nắng sớm · chiều vàng · Ba Vì · hoàng hôn phía Tây.']
];

try {
  for (const [slug, name, category, lat, lng, description] of places) {
    await pool.query(
      `INSERT INTO places (slug, name, category, lat, lng, description)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET
         name=EXCLUDED.name, category=EXCLUDED.category, lat=EXCLUDED.lat,
         lng=EXCLUDED.lng, description=EXCLUDED.description, updated_at=NOW()`,
      [slug, name, category, lat, lng, description]
    );
  }

  for (const [number, title, dates, kicker, description] of tours) {
    await pool.query(
      `INSERT INTO tours (number, title, dates, kicker, description, status)
       VALUES ($1,$2,$3,$4,$5,'PUBLISHED')
       ON CONFLICT (number) DO UPDATE SET
         title=EXCLUDED.title, dates=EXCLUDED.dates, kicker=EXCLUDED.kicker,
         description=EXCLUDED.description, status='PUBLISHED', updated_at=NOW()`,
      [number, title, dates, kicker, description]
    );
  }

  console.log('HALO HOLA seed complete.');
} finally {
  await pool.end();
}
