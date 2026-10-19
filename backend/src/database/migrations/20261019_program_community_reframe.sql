-- Reframe HALO HOLA 2026 from a contest-first experience to a community contribution program.
-- Keep TOP52 / awards as recognition layers while public copy emphasizes contribution,
-- documentation and collective storytelling about Hòa Lạc.

UPDATE site_sections
SET content = content || jsonb_build_object(
      'description', 'Cùng đóng góp hình ảnh, câu chuyện và trải nghiệm để tạo nên một Hòa Lạc được kể bởi chính cộng đồng.'
    ),
    updated_at = NOW()
WHERE section_key = 'hero';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'CỘNG ĐỒNG ĐANG CÙNG GÓP NHỮNG GÓC NHÌN',
      'title', 'Mỗi ngày thêm một góc nhìn mới.',
      'description', 'Cùng khám phá, ghi lại và đóng góp những góc nhìn, câu chuyện, địa điểm và trải nghiệm để xây dựng kho tư liệu cộng đồng về Hòa Lạc hôm nay và mai sau.',
      'ctaText', 'Gửi góc nhìn'
    ),
    updated_at = NOW()
WHERE section_key = 'campaign';

UPDATE site_sections
SET label = 'Góc nhìn & Stories',
    content = content || jsonb_build_object(
      'eyebrow', 'GÓC NHÌN · CÂU CHUYỆN · HÒA LẠC',
      'title', 'Những góc nhìn đã được kể',
      'description', 'Những đóng góp đã được công bố — mỗi hình ảnh, video, câu chuyện và sáng tạo cùng làm đầy thêm bức tranh Hòa Lạc từ chính cộng đồng.'
    ),
    updated_at = NOW()
WHERE section_key = 'stories';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'description', 'Cùng kể chuyện, chia sẻ dữ liệu, kết nối con người và chung tay xây dựng một Hòa Lạc xanh hơn, đẹp hơn, giàu bản sắc hơn.'
    ),
    updated_at = NOW()
WHERE section_key = 'community';

-- Persist the new participation language in CMS settings so existing production data
-- does not override the frontend defaults after deploy.
INSERT INTO site_settings (setting_key, value, updated_at)
VALUES (
  'header',
  '{"searchLabel":"Theo dõi góc nhìn","ctaText":"GỬI GÓC NHÌN","ctaUrl":"/gui-goc-nhin"}'::jsonb,
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = site_settings.value || EXCLUDED.value,
    updated_at = NOW();

UPDATE site_settings
SET value = jsonb_set(
      value,
      '{navLinks}',
      COALESCE((
        SELECT jsonb_agg(
          CASE
            WHEN item->>'href' = '/the-le-giai-thuong'
              THEN jsonb_set(item, '{label}', to_jsonb('Cách tham gia & Ghi nhận'::text), true)
            ELSE item
          END
          ORDER BY ord
        )
        FROM jsonb_array_elements(COALESCE(value->'navLinks','[]'::jsonb)) WITH ORDINALITY AS links(item, ord)
      ), '[]'::jsonb),
      true
    ),
    updated_at = NOW()
WHERE setting_key = 'header'
  AND jsonb_typeof(value->'navLinks') = 'array';

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES (
  'footer',
  '{"description":"Nơi cộng đồng cùng khám phá, ghi lại, đóng góp và kể tiếp những câu chuyện về Hòa Lạc."}'::jsonb,
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = site_settings.value || EXCLUDED.value,
    updated_at = NOW();

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES (
  'rulesAwards',
  '{"title":"Cách tham gia & Ghi nhận HALO HOLA 2026","intro":"Hướng dẫn gửi góc nhìn, nguyên tắc đóng góp, mốc thời gian và các hạng mục ghi nhận của chương trình cộng đồng HALO HOLA 2026."}'::jsonb,
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = site_settings.value || EXCLUDED.value,
    updated_at = NOW();

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES (
  'seo',
  '{"defaultTitle":"HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc","defaultDescription":"HALO HOLA 2026 là chương trình cộng đồng cùng khám phá, ghi lại và đóng góp những góc nhìn, câu chuyện, địa điểm và trải nghiệm về Hòa Lạc."}'::jsonb,
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = site_settings.value || EXCLUDED.value,
    updated_at = NOW();
