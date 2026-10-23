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

const mimeByExtension = new Map([
  ['.jpg', new Set(['image/jpeg'])],
  ['.jpeg', new Set(['image/jpeg'])],
  ['.png', new Set(['image/png'])],
  ['.webp', new Set(['image/webp'])],
  ['.avif', new Set(['image/avif'])],
  ['.tif', new Set(['image/tiff'])],
  ['.tiff', new Set(['image/tiff'])],
  ['.dng', new Set(['image/x-adobe-dng','application/octet-stream'])],
  ['.cr2', new Set(['image/x-canon-cr2','application/octet-stream'])],
  ['.nef', new Set(['image/x-nikon-nef','application/octet-stream'])],
  ['.arw', new Set(['image/x-sony-arw','application/octet-stream'])],
  ['.mp4', new Set(['video/mp4'])],
  ['.mov', new Set(['video/quicktime'])],
  ['.pdf', new Set(['application/pdf'])],
  ['.doc', new Set(['application/msword'])],
  ['.docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])],
  ['.mp3', new Set(['audio/mpeg','audio/mp3'])]
]);

function fileFilter(_req,file,cb){
  const ext = path.extname(file.originalname || '').toLowerCase();
  const acceptedMimes = mimeByExtension.get(ext);
  if (!acceptedMimes || !acceptedMimes.has(String(file.mimetype || '').toLowerCase())) {
    return cb(new AppError('Định dạng tệp hoặc phần mở rộng không được hỗ trợ.', 400));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxUploadFileSizeMb * 1024 * 1024,
    files: env.maxUploadFileCount,
    fields: 40,
    fieldNameSize: 80,
    fieldSize: 20 * 1024,
    parts: env.maxUploadFileCount + 45,
    headerPairs: 100
  },
  fileFilter
});

// Submission originals remain capped at MAX_UPLOAD_FILE_COUNT, while the browser
// may attach up to six lightweight WebP/AVIF derivatives for each original image.
// Field-level maxCount on the route still protects the number of originals.
export const submissionUpload = multer({
  storage,
  limits:{
    fileSize:env.maxUploadFileSizeMb*1024*1024,
    files:env.maxUploadFileCount*7,
    fields:40,
    fieldNameSize:80,
    fieldSize:20*1024,
    parts:env.maxUploadFileCount*7+45,
    headerPairs:100
  },
  fileFilter
});

const photographerExtensions = new Set([
  '.jpg','.jpeg','.png','.webp','.avif','.tif','.tiff','.dng','.cr2','.nef','.arw'
]);

function photographerFileFilter(_req,file,cb){
  const ext = path.extname(file.originalname || '').toLowerCase();
  const acceptedMimes = mimeByExtension.get(ext);
  if (!photographerExtensions.has(ext) || !acceptedMimes || !acceptedMimes.has(String(file.mimetype || '').toLowerCase())) {
    return cb(new AppError('Đội ảnh chỉ tải file ảnh hoặc RAW được hỗ trợ.', 400));
  }
  cb(null, true);
}

export const photographerUpload = multer({
  storage,
  limits:{
    fileSize:100*1024*1024,
    files:30,
    fields:10,
    fieldNameSize:80,
    fieldSize:20*1024,
    parts:45,
    headerPairs:100
  },
  fileFilter:photographerFileFilter
});

