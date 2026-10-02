import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const uploadRoot = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  }
});

const allowed = new Set([
  'image/jpeg','image/png','image/webp','video/mp4','video/quicktime',
  'application/pdf','audio/mpeg'
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxUploadFileSizeMb * 1024 * 1024,
    files: env.maxUploadFileCount
  },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new AppError('Định dạng tệp không được hỗ trợ.', 400));
    }
    cb(null, true);
  }
});
