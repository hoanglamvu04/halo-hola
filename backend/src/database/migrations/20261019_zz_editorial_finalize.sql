-- Final CMS pass after the 2026–2027 editorial refactor.
-- This migration is intentionally later than 20261019_z_editorial_alignment_full.sql.

UPDATE site_sections
SET content = content || jsonb_build_object(
      'title', 'Hòa Lạc đang thay đổi',
      'description', 'Từ Xứ Đoài trầm tích, văn hóa Mường, làng xóm và đá ong đến tri thức, công nghệ, kiến trúc và những cộng đồng mới — Hòa Lạc đang lớn lên bằng nhiều lớp thời gian cùng tồn tại.'
    ),
    updated_at = NOW()
WHERE section_key = 'change';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'SẮC MÀU HÒA LẠC',
      'title', 'Hòa Lạc trong bạn có màu gì?',
      'description', 'Sắc màu là một lớp nhận diện xuyên suốt, không phải một mạch nội dung riêng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc.'
    ),
    updated_at = NOW()
WHERE section_key = 'colors';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'NHỮNG CÂU CHUYỆN GẮN VỚI NƠI CHỐN',
      'title', 'HOLA Map',
      'description', 'Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ tương tác — nơi tư liệu digital gặp không gian thật của Hòa Lạc.'
    ),
    updated_at = NOW()
WHERE section_key = 'map';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'HALO HOLA KỂ · WE HOLA LÀM',
      'title', 'WE HOLA – Chúng ta là Hòa Lạc',
      'description', 'Từ những câu chuyện được kể, cộng đồng cùng biến điều đáng quan tâm thành những hành động nhỏ, cụ thể và có ích cho Hòa Lạc.'
    ),
    updated_at = NOW()
WHERE section_key = 'community';

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES ('header', '{}'::jsonb, NOW())
ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET value = value || jsonb_build_object(
      'ctaText','GỬI MỘT GÓC NHÌN',
      'ctaUrl','/gui-goc-nhin',
      'searchLabel','Theo dõi góc nhìn',
      'navLinks','[
        {"label":"Khám phá","href":"/"},
        {"label":"7 mạch","href":"/chu-de"},
        {"label":"HOLA Tour","href":"/hola-tour"},
        {"label":"HOLA Map","href":"/hola-map"},
        {"label":"Stories","href":"/stories"},
        {"label":"HOLA DAY","href":"/hola-day"},
        {"label":"52 góc nhìn","href":"/top52"},
        {"label":"Cách đóng góp","href":"/the-le-giai-thuong"},
        {"label":"Calendar 2027","href":"/calendar-2027"},
        {"label":"WE HOLA","href":"/we-hola"}
      ]'::jsonb
    ),
    updated_at = NOW()
WHERE setting_key='header';

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES ('footer', '{}'::jsonb, NOW())
ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET value = value || jsonb_build_object(
      'description','HALO HOLA đi tìm, biên tập và kể những câu chuyện đáng được giữ lại về Hòa Lạc. 2026: 52 góc nhìn · 1 Hòa Lạc. 2027: 52 tuần · 52 câu chuyện.'
    ),
    updated_at=NOW()
WHERE setting_key='footer';

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES ('seo', '{}'::jsonb, NOW())
ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET value = value || jsonb_build_object(
      'defaultTitle','HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc',
      'defaultDescription','HALO HOLA 2026 là hành trình cộng đồng và dự án biên tập – khám phá – lưu giữ 52 câu chuyện về Hòa Lạc; 24.11 mở ra HALO HOLA 2027 với 52 tuần · 52 câu chuyện.'
    ),
    updated_at=NOW()
WHERE setting_key='seo';
