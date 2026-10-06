import dotenv from 'dotenv';

dotenv.config();

const nodeEnv=process.env.NODE_ENV || 'development';

function requireInProduction(name, value, fallback) {
  if (value) return value;
  if (nodeEnv === 'production') throw new Error(`Missing required environment variable: ${name}`);
  return fallback;
}

function clampNumber(value,min,max,fallback){
  const number=Number(value);
  if(!Number.isFinite(number)) return fallback;
  return Math.min(max,Math.max(min,number));
}

const databaseUrl=requireInProduction(
  'DATABASE_URL',
  process.env.DATABASE_URL,
  'postgresql://postgres:postgres@localhost:5432/halo_hola'
);
const jwtSecret=requireInProduction('JWT_SECRET',process.env.JWT_SECRET,'dev-only-halo-hola-secret');

if(nodeEnv==='production' && jwtSecret.length<32){
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

export const env = {
  nodeEnv,
  port: clampNumber(process.env.PORT,1,65535,5000),
  databaseUrl,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((x) => x.trim()).filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadFileSizeMb: clampNumber(process.env.MAX_UPLOAD_FILE_SIZE_MB,1,100,25),
  maxUploadFileCount: clampNumber(process.env.MAX_UPLOAD_FILE_COUNT,1,10,10),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${clampNumber(process.env.PORT,1,65535,5000)}`,
  adminApiKey: (process.env.ADMIN_API_KEY || '').trim()
};
