import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

async function resolveUser(token) {
  const payload = verifyToken(token);
  const { rows } = await pool.query(
    'SELECT id, name, email, role, account_status FROM users WHERE id = $1',
    [payload.id]
  );
  const user = rows[0];
  if (!user) throw new AppError('Tài khoản không tồn tại.', 401);
  if (user.account_status !== 'ACTIVE') throw new AppError('Tài khoản đã bị khóa.', 403);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(new AppError('Authentication required.', 401));

  try {
    req.user = await resolveUser(token);
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 401));
  }
}

export async function authenticateAdmin(req, res, next) {
  // x-admin-key is a local/dev convenience only. Production admin access must
  // always go through an authenticated user so account status/roles are enforced.
  if (env.nodeEnv !== 'production' && env.adminApiKey && req.header('x-admin-key') === env.adminApiKey) {
    req.user = { id: 'dev-api-key', email: 'dev@local', role: 'ADMIN' };
    return next();
  }

  return authenticate(req, res, (error) => {
    if (error) return next(error);
    if (!['MODERATOR', 'ADMIN'].includes(req.user?.role)) {
      return next(new AppError('Bạn không có quyền quản trị.', 403));
    }
    return next();
  });
}

export async function authenticateJury(req, res, next) {
  return authenticate(req, res, (error) => {
    if (error) return next(error);
    if (!['JUROR', 'MODERATOR', 'ADMIN'].includes(req.user?.role)) {
      return next(new AppError('Tài khoản không có quyền truy cập Hội đồng giám khảo.', 403));
    }
    return next();
  });
}

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) return next(new AppError('Bạn không có quyền thực hiện thao tác này.',403));
    return next();
  };
}
