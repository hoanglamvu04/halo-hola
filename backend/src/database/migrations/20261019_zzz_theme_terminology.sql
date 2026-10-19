-- Public terminology pass: keep the current seven groups, call them "chủ đề" everywhere.
-- Data model/API names remain unchanged (themes/theme) for compatibility.

UPDATE site_sections
SET label = '7 chủ đề',
    content = content || jsonb_build_object(
      'eyebrow', '7 CHỦ ĐỀ · BA TRỤC XUYÊN SUỐT',
      'title', '7 chủ đề Hòa Lạc',
      'description', 'Bản sắc · Thiên nhiên · Không gian · Con người · Tri thức & Công nghệ · Đời sống & Cảm xúc · Tương lai. Ba trục xuyên suốt: Bản sắc · Sáng tạo · Tương lai.'
    ),
    updated_at = NOW()
WHERE section_key = 'themes';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'description', 'Sắc màu là một lớp nhận diện xuyên suốt, không phải một chủ đề riêng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc.'
    ),
    updated_at = NOW()
WHERE section_key = 'colors';

-- Replace stale CMS wording that could override frontend fallbacks.
UPDATE site_sections
SET content = replace(
                replace(
                  replace(
                    replace(
                      replace(content::text, '7 mạch kể Hòa Lạc', '7 chủ đề Hòa Lạc'),
                      '7 mạch nội dung', '7 chủ đề'
                    ),
                    'BẢY MẠCH', '7 CHỦ ĐỀ'
                  ),
                  'Bảy mạch', 'Bảy chủ đề'
                ),
                'mạch nội dung', 'chủ đề'
              )::jsonb,
    updated_at = NOW()
WHERE content::text ILIKE '%mạch%';

INSERT INTO site_settings (setting_key, value, updated_at)
VALUES ('header', '{}'::jsonb, NOW())
ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET value = jsonb_set(
      value,
      '{navLinks}',
      COALESCE((
        SELECT jsonb_agg(
          CASE
            WHEN item->>'href' = '/chu-de'
              THEN item || jsonb_build_object('label', 'Chủ đề')
            ELSE item
          END
        )
        FROM jsonb_array_elements(COALESCE(value->'navLinks', '[]'::jsonb)) AS item
      ), '[]'::jsonb),
      true
    ),
    updated_at = NOW()
WHERE setting_key = 'header';

-- Other CMS settings can also contain public copy from the previous editorial pass.
UPDATE site_settings
SET value = replace(
              replace(
                replace(
                  replace(
                    replace(value::text, '7 mạch kể Hòa Lạc', '7 chủ đề Hòa Lạc'),
                    '7 mạch nội dung', '7 chủ đề'
                  ),
                  'BẢY MẠCH', '7 CHỦ ĐỀ'
                ),
                'Bảy mạch', 'Bảy chủ đề'
              ),
              'mạch nội dung', 'chủ đề'
            )::jsonb,
    updated_at = NOW()
WHERE value::text ILIKE '%mạch%';

-- Editorial stories may have been seeded with the temporary "mạch" terminology.
UPDATE stories
SET title = replace(replace(replace(title, '7 mạch nội dung', '7 chủ đề'), 'Bảy mạch', 'Bảy chủ đề'), 'mạch nội dung', 'chủ đề'),
    category = replace(replace(replace(COALESCE(category,''), '7 mạch nội dung', '7 chủ đề'), 'Bảy mạch', 'Bảy chủ đề'), 'mạch nội dung', 'chủ đề'),
    excerpt = replace(replace(replace(excerpt, '7 mạch nội dung', '7 chủ đề'), 'Bảy mạch', 'Bảy chủ đề'), 'mạch nội dung', 'chủ đề'),
    lead = replace(replace(replace(COALESCE(lead,''), '7 mạch nội dung', '7 chủ đề'), 'Bảy mạch', 'Bảy chủ đề'), 'mạch nội dung', 'chủ đề'),
    quote = replace(replace(replace(COALESCE(quote,''), '7 mạch nội dung', '7 chủ đề'), 'Bảy mạch', 'Bảy chủ đề'), 'mạch nội dung', 'chủ đề'),
    content = replace(replace(replace(content, '7 mạch nội dung', '7 chủ đề'), 'Bảy mạch', 'Bảy chủ đề'), 'mạch nội dung', 'chủ đề'),
    body = replace(
             replace(
               replace(body::text, '7 mạch nội dung', '7 chủ đề'),
               'Bảy mạch', 'Bảy chủ đề'
             ),
             'mạch nội dung', 'chủ đề'
           )::jsonb,
    updated_at = NOW()
WHERE title ILIKE '%mạch%'
   OR COALESCE(category,'') ILIKE '%mạch%'
   OR excerpt ILIKE '%mạch%'
   OR COALESCE(lead,'') ILIKE '%mạch%'
   OR COALESCE(quote,'') ILIKE '%mạch%'
   OR content ILIKE '%mạch%'
   OR body::text ILIKE '%mạch%';
