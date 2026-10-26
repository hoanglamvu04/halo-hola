import crypto from 'node:crypto';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const CONNECTION_KEYS = ['smtp', 'hola_maps', 'r2'];
const SECRETS = {
  smtp: ['password'],
  hola_maps: ['secret'],
  r2: ['accessKeyId', 'secretAccessKey']
};
let managed = new Map();

function defaults(key) {
  if (key === 'smtp') return {
    enabled: true,
    host: String(process.env.SMTP_HOST || '').trim(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    user: String(process.env.SMTP_USER || '').trim(),
    password: String(process.env.SMTP_PASS || ''),
    fromName: String(process.env.MAIL_FROM_NAME || 'HALO HOLA').trim(),
    fromAddress: String(process.env.MAIL_FROM || '').trim()
  };
  if (key === 'hola_maps') return {
    enabled: true,
    baseUrl: env.holaMapsBaseUrl,
    secret: env.holaMapsHaloSecret,
    timeoutMs: env.holaMapsSyncTimeoutMs
  };
  if (key === 'r2') return {
    enabled: true,
    endpoint: String(process.env.R2_ENDPOINT || '').trim(),
    accessKeyId: String(process.env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: String(process.env.R2_SECRET_ACCESS_KEY || ''),
    bucketOriginals: String(process.env.R2_BUCKET_ORIGINALS || '').trim(),
    bucketPublic: String(process.env.R2_BUCKET_PUBLIC || '').trim()
  };
  throw new AppError('Kết nối không được hỗ trợ.', 404);
}

function encryptionKey() {
  // Reuse the existing server-only production secret; no new .env variable.
  // Rotating JWT_SECRET requires re-entering integration credentials.
  return crypto.createHmac('sha256', env.jwtSecret)
    .update('halo-hola-integration-credentials-v1').digest();
}

export function encryptConnectionSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join(':');
}

export function decryptConnectionSecret(value) {
  const [version, iv, tag, encrypted, extra] = String(value || '').split(':');
  if (version !== 'v1' || !iv || !tag || !encrypted || extra !== undefined) {
    throw new Error('Stored integration credential has an invalid format.');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
}

function hydrate(key, stored) {
  const configuration = { ...defaults(key), ...stored };
  for (const field of SECRETS[key]) {
    const encrypted = configuration[field + 'Encrypted'];
    configuration[field] = encrypted ? decryptConnectionSecret(encrypted) : '';
    delete configuration[field + 'Encrypted'];
  }
  return configuration;
}

export async function refreshConnectionSettings() {
  const { rows } = await pool.query(
    'SELECT connection_key, config, updated_at FROM integration_connections'
  );
  const next = new Map();
  for (const row of rows) {
    if (!CONNECTION_KEYS.includes(row.connection_key)) continue;
    next.set(row.connection_key, {
      config: hydrate(row.connection_key, row.config || {}),
      updatedAt: row.updated_at
    });
  }
  managed = next; // Swap atomically so requests never read a partially refreshed map.
}

export function getConnectionConfig(key) {
  return managed.get(key)?.config || defaults(key);
}

export function isConnectionConfigured(key, config = getConnectionConfig(key)) {
  if (config.enabled === false) return false;
  if (key === 'smtp') return Boolean(
    config.host && config.fromAddress &&
    ((config.user && config.password) || (!config.user && !config.password))
  );
  if (key === 'hola_maps') return Boolean(config.baseUrl && config.secret);
  if (key === 'r2') return Boolean(
    config.endpoint && config.accessKeyId && config.secretAccessKey &&
    config.bucketOriginals && config.bucketPublic
  );
  return false;
}

export function publicConnectionStatus(key) {
  const config = getConnectionConfig(key);
  const publicConfig = { ...config };
  const secrets = {};
  for (const field of SECRETS[key]) {
    secrets[field] = Boolean(config[field]);
    delete publicConfig[field];
  }
  return {
    key,
    source: managed.has(key) ? 'admin' : 'env',
    configured: isConnectionConfigured(key, config),
    enabled: config.enabled !== false,
    config: publicConfig,
    secrets,
    updatedAt: managed.get(key)?.updatedAt || null
  };
}

export function listConnectionStatuses() {
  return CONNECTION_KEYS.map(publicConnectionStatus);
}

function assertSafeEndpoint(value, label) {
  let url;
  try { url = new URL(value); }
  catch { throw new AppError(label + ' phải là URL hợp lệ.', 400); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) {
    throw new AppError(label + ' phải là URL gốc, không chứa tài khoản hoặc đường dẫn.', 400);
  }
  if (env.nodeEnv === 'production' && url.protocol !== 'https:') {
    throw new AppError(label + ' phải sử dụng HTTPS trên production.', 400);
  }
  if (env.nodeEnv === 'production' && (
    url.hostname === 'localhost' || url.hostname.endsWith('.localhost') ||
    /^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(url.hostname) ||
    url.hostname === '[::1]'
  )) {
    throw new AppError(label + ' không được trỏ tới máy chủ nội bộ.', 400);
  }
  return url.origin;
}

function validateConfiguration(key, config) {
  if (!isConnectionConfigured(key, config)) {
    if (config.enabled === false) return;
    throw new AppError('Cần điền đủ thông tin kết nối trước khi bật.', 400);
  }
  if (key === 'hola_maps') config.baseUrl = assertSafeEndpoint(config.baseUrl, 'HOLA Maps URL');
  if (key === 'r2') config.endpoint = assertSafeEndpoint(config.endpoint, 'R2 endpoint');
}

export async function saveConnectionSettings(key, input, userId) {
  if (!CONNECTION_KEYS.includes(key)) throw new AppError('Kết nối không được hỗ trợ.', 404);
  const current = getConnectionConfig(key);
  const config = { ...current, ...input };
  for (const field of SECRETS[key]) {
    // Empty password fields mean "keep the saved credential", never "show it".
    config[field] = String(input[field] || current[field] || '');
  }
  validateConfiguration(key, config);

  const stored = { ...config };
  for (const field of SECRETS[key]) {
    stored[field + 'Encrypted'] = stored[field] ? encryptConnectionSecret(stored[field]) : '';
    delete stored[field];
  }
  await pool.query(
    `INSERT INTO integration_connections(connection_key,config,updated_by)
     VALUES($1,$2::jsonb,$3)
     ON CONFLICT(connection_key) DO UPDATE SET
       config=EXCLUDED.config, updated_by=EXCLUDED.updated_by, updated_at=NOW()`,
    [key, JSON.stringify(stored), String(userId || 'ADMIN')]
  );
  await refreshConnectionSettings();
  return publicConnectionStatus(key);
}

export async function resetConnectionSettings(key) {
  if (!CONNECTION_KEYS.includes(key)) throw new AppError('Kết nối không được hỗ trợ.', 404);
  await pool.query('DELETE FROM integration_connections WHERE connection_key=$1', [key]);
  await refreshConnectionSettings();
  return publicConnectionStatus(key);
}
