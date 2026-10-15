-- Keep every public CMS occurrence of the legacy HALO HOLA contact email in sync.
UPDATE site_settings
SET value = replace(value::text, 'admin@halohola.vn', 'admin@xspace.vn')::jsonb,
    updated_at = NOW()
WHERE value::text LIKE '%admin@halohola.vn%';

UPDATE site_sections
SET content = replace(content::text, 'admin@halohola.vn', 'admin@xspace.vn')::jsonb,
    updated_at = NOW()
WHERE content::text LIKE '%admin@halohola.vn%';

-- Ensure the shared footer/contact setting always exposes the new address,
-- while preserving every other Footer setting already edited in Admin.
INSERT INTO site_settings (setting_key, value, updated_at)
VALUES (
  'footer',
  jsonb_build_object('email', 'admin@xspace.vn'),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = COALESCE(site_settings.value, '{}'::jsonb) || jsonb_build_object('email', 'admin@xspace.vn'),
    updated_at = NOW();
