-- Final terminology cleanup after switching the public label from "mạch" back to "chủ đề".
-- This is intentionally a new migration so production databases that already applied earlier
-- editorial migrations also receive the copy update.

UPDATE site_sections
SET content = replace(content::text, 'mạch', 'chủ đề')::jsonb,
    updated_at = NOW()
WHERE content::text ILIKE '%mạch%';

UPDATE site_settings
SET value = replace(value::text, 'mạch', 'chủ đề')::jsonb,
    updated_at = NOW()
WHERE value::text ILIKE '%mạch%';

UPDATE stories
SET title = replace(title, 'mạch', 'chủ đề'),
    category = CASE WHEN category IS NULL THEN NULL ELSE replace(category, 'mạch', 'chủ đề') END,
    excerpt = replace(excerpt, 'mạch', 'chủ đề'),
    lead = CASE WHEN lead IS NULL THEN NULL ELSE replace(lead, 'mạch', 'chủ đề') END,
    quote = CASE WHEN quote IS NULL THEN NULL ELSE replace(quote, 'mạch', 'chủ đề') END,
    content = replace(content, 'mạch', 'chủ đề'),
    body = replace(body::text, 'mạch', 'chủ đề')::jsonb,
    updated_at = NOW()
WHERE title ILIKE '%mạch%'
   OR COALESCE(category,'') ILIKE '%mạch%'
   OR excerpt ILIKE '%mạch%'
   OR COALESCE(lead,'') ILIKE '%mạch%'
   OR COALESCE(quote,'') ILIKE '%mạch%'
   OR content ILIKE '%mạch%'
   OR body::text ILIKE '%mạch%';

-- Keep the public navigation label concise and familiar.
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
