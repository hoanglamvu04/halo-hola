import dotenv from 'dotenv';

dotenv.config();

function requireInProduction(name, value, fallback) {
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/halo_hola',
  jwtSecret: requireInProduction('JWT_SECRET', process.env.JWT_SECRET, 'dev-only-halo-hola-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((x) => x.trim()).filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadFileSizeMb: Math.max(Number(process.env.MAX_UPLOAD_FILE_SIZE_MB) || 25, 1),
  maxUploadFileCount: Math.max(Number(process.env.MAX_UPLOAD_FILE_COUNT) || 10, 1),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${Number(process.env.PORT) || 5000}`,
  adminApiKey: (process.env.ADMIN_API_KEY || '').trim()
};
