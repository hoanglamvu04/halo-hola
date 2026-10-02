import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../database/pool.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200)
});

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const input = schema.parse(req.body);
    const { rows } = await pool.query(
      'SELECT id,name,email,password_hash,role,account_status FROM users WHERE email = $1',
      [input.email.toLowerCase()]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      throw new AppError('Email hoặc mật khẩu không đúng.', 401);
    }
    if (user.account_status !== 'ACTIVE') {
      throw new AppError('Tài khoản đã bị khóa.', 403);
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Dữ liệu đăng nhập không hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;
