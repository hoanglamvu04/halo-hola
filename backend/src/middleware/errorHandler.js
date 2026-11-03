import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl, requestId: req.requestId || undefined });
}

const multerFailures = {
  LIMIT_FILE_SIZE: [413, 'Có file vượt quá dung lượng cho phép. Vui lòng chọn file nhỏ hơn.'],
  LIMIT_FILE_COUNT: [413, 'Số lượng file vượt quá giới hạn tải lên. Vui lòng giảm số file.'],
  LIMIT_PART_COUNT: [413, 'Bộ ảnh có quá nhiều thành phần tải lên. Vui lòng giảm số file.'],
  LIMIT_UNEXPECTED_FILE: [400, 'Số lượng file hoặc loại tệp đính kèm không hợp lệ.'],
  LIMIT_FIELD_COUNT: [400, 'Biểu mẫu gửi quá nhiều trường dữ liệu.'],
  LIMIT_FIELD_VALUE: [413, 'Một trường biểu mẫu vượt quá giới hạn ký tự.'],
  LIMIT_FIELD_KEY: [400, 'Tên trường tải lên không hợp lệ.']
};

export function errorHandler(error, req, res, _next) {
  const uploadFailure = error?.name === 'MulterError' ? multerFailures[error.code] : null;
  const storageUnavailable = ['ENOSPC', 'EACCES', 'EMFILE'].includes(error?.code);
  const statusCode = uploadFailure?.[0] || (storageUnavailable ? 503 : (error.statusCode && error.statusCode >= 400 ? error.statusCode : 500));
  const operational = error.isOperational === true || Boolean(uploadFailure) || storageUnavailable;
  const message = uploadFailure?.[1] || (storageUnavailable
    ? 'Bộ nhớ tải lên trên máy chủ chưa sẵn sàng. Vui lòng thử lại sau.'
    : (operational ? error.message : 'Internal server error.'));

  if (!error.isOperational) console.error(`[${req.requestId || 'no-request-id'}]`, error);

  const body = { error: message, requestId: req.requestId || undefined };
  if (error.details) body.details = error.details;
  if (env.nodeEnv !== 'production' && !operational) body.stack = error.stack;

  res.status(statusCode).json(body);
}
