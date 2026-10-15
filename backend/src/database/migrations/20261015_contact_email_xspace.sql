INSERT INTO site_settings (setting_key, value, updated_at)
VALUES (
  'footer',
  jsonb_build_object('email', 'admin@xspace.vn'),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = COALESCE(site_settings.value, '{}'::jsonb) || jsonb_build_object('email', 'admin@xspace.vn'),
    updated_at = NOW();
