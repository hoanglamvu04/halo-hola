import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';
import { validateHolaEmbedUrl } from '../../../shared/holaEmbedUrl.js';

const HOLA_EMBED_SETTING_KEY = 'hola_embed';

// Only the public approved iframe URL belongs in site_settings.
// Neither HOLA_MAPS_HALO_SECRET nor VITE_HOLA_MAPS_API_KEY is read here.
export async function getPublicHolaEmbedConfig() {
  const { rows } = await pool.query(
    'SELECT value FROM site_settings WHERE setting_key=$1 LIMIT 1',
    [HOLA_EMBED_SETTING_KEY]
  );
  const configuredUrl = rows[0]?.value?.embedUrl;
  const checked = validateHolaEmbedUrl(configuredUrl);
  // Fail closed if a stored value becomes malformed. No legacy keyless iframe.
  return { embedUrl: checked.valid ? checked.url : '' };
}

export async function saveHolaEmbedConfig(input) {
  if (typeof input?.embedUrl !== 'string') {
    throw new AppError('Cần cung cấp trường embedUrl dưới dạng chuỗi.', 400);
  }
  const raw = input.embedUrl.trim();
  const checked = validateHolaEmbedUrl(raw);
  if (raw && !checked.valid) {
    throw new AppError(checked.message, 400);
  }
  // Clearing the field deliberately disables the iframe immediately.
  const embedUrl = checked.valid ? checked.url : '';
  await pool.query(
    `INSERT INTO site_settings(setting_key,value,updated_at)
     VALUES($1,$2::jsonb,NOW())
     ON CONFLICT(setting_key) DO UPDATE
       SET value=EXCLUDED.value,updated_at=NOW()`,
    [HOLA_EMBED_SETTING_KEY, JSON.stringify({ embedUrl })]
  );
  return { embedUrl };
}
