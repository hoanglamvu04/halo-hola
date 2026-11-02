// Public iframe identifiers only. Never accept a server-to-server or Browser API secret here.
// HOLA Maps Embed Platform V1 issues "he_" + 32 URL-safe characters (PR #59).
export const HOLA_MAPS_HOME_URL = 'https://maps.dothihoalac.vn/';
export const HOLA_EMBED_HOST = 'maps.dothihoalac.vn';
export const HOLA_EMBED_PATHS = Object.freeze(['/embed', '/embed/halo', '/embed/picker']);
export const HOLA_EMBED_KEY_PATTERN = /^he_[A-Za-z0-9_-]{32}$/;

function invalid(code, message) {
  return { valid: false, url: '', code, message };
}

/**
 * Validate an iframe URL copied from the HOLA Maps approved-apps page.
 * Returning a canonical URL also strips unintended URL variations.
 * This is syntax validation, NOT a grant/status/CSP verification.
 */
export function validateHolaEmbedUrl(input) {
  if (typeof input !== 'string' || !input.trim()) {
    return invalid('EMPTY', 'Chưa cấu hình URL nhúng do HOLA Maps cấp.');
  }
  const raw = input.trim();
  if (raw.length > 2048 || /[\u0000-\u001f\u007f]/.test(raw)) {
    return invalid('INVALID_URL', 'URL nhúng không hợp lệ.');
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    return invalid('INVALID_URL', 'URL nhúng không hợp lệ.');
  }

  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) {
    return invalid('HTTPS_REQUIRED', 'URL nhúng phải dùng HTTPS, không chứa tài khoản, cổng tùy chỉnh hoặc fragment.');
  }
  if (url.hostname !== HOLA_EMBED_HOST || url.origin !== 'https://' + HOLA_EMBED_HOST) {
    return invalid('WRONG_HOST', 'Chỉ chấp nhận URL từ https://maps.dothihoalac.vn.');
  }
  if (!HOLA_EMBED_PATHS.includes(url.pathname)) {
    return invalid('WRONG_PATH', 'Chỉ hỗ trợ /embed, /embed/halo hoặc /embed/picker.');
  }

  // HOLA Embed Platform V1 only documents the public "key" query parameter.
  // Reject additional or duplicate params to avoid ambiguous routing or redirects.
  const params = [...url.searchParams.entries()];
  if (params.length !== 1 || params[0][0] !== 'key' || !HOLA_EMBED_KEY_PATTERN.test(params[0][1])) {
    return invalid('INVALID_KEY', 'URL phải chứa đúng một tham số key hợp lệ, bắt đầu bằng he_ và có thêm 32 ký tự.');
  }

  return {
    valid: true,
    url: 'https://' + HOLA_EMBED_HOST + url.pathname + '?key=' + params[0][1],
    code: 'VALID',
    message: 'Định dạng URL hợp lệ. Quyền nhúng thực tế vẫn do HOLA Maps kiểm soát.'
  };
}

export function getHolaEmbedViewState(input) {
  const validation = validateHolaEmbedUrl(input);
  return validation.valid
    ? { mode: 'embed', embedUrl: validation.url }
    : { mode: 'waiting', embedUrl: '' };
}


/**
 * The picker is covered by the SAME approved HOLA Embed Platform V1 key
 * as /embed. Use only the public key from the validated site setting.
 * Other picker query arguments are allowed by the upstream /embed/* gateway.
 */
export function buildHolaPickerUrl(embedUrl, { origin, lat, lng, label } = {}) {
  const checked = validateHolaEmbedUrl(embedUrl);
  if (!checked.valid) return '';

  // The picker posts its location to this exact parent origin. Never use
  // arbitrary origins from API responses or URL query parameters.
  const requestedOrigin = String(origin || '');
  let parent;
  try { parent = new URL(requestedOrigin); } catch { return ''; }
  const localDevelopment = parent.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(parent.hostname);
  if (!(parent.protocol === 'https:' || localDevelopment) ||
      parent.origin !== requestedOrigin || parent.username || parent.password ||
      parent.search || parent.hash || parent.pathname !== '/') {
    return '';
  }

  const issuedKey = new URL(checked.url).searchParams.get('key');
  const picker = new URL('/embed/picker', HOLA_MAPS_HOME_URL);
  picker.searchParams.set('key', issuedKey);
  picker.searchParams.set('origin', parent.origin);

  const hasLat = lat !== null && lat !== undefined && String(lat).trim() !== '';
  const hasLng = lng !== null && lng !== undefined && String(lng).trim() !== '';
  if (hasLat && hasLng) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (Number.isFinite(latitude) && Number.isFinite(longitude) &&
        latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      picker.searchParams.set('lat', String(latitude));
      picker.searchParams.set('lng', String(longitude));
    }
  }

  const safeLabel = String(label || '').trim().slice(0, 240);
  if (safeLabel) picker.searchParams.set('label', safeLabel);
  return picker.toString();
}
