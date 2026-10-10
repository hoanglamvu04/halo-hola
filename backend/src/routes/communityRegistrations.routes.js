import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';
import { registerCommunity } from '../services/communityRegistration.service.js';

const router = Router();

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(8).max(60),
  roleLabel: z.string().trim().max(120).optional().or(z.literal('')),
  interest: z.string().trim().max(1500).optional().or(z.literal('')),
  note: z.string().trim().max(1500).optional().or(z.literal('')),
  allowUpdates: z.boolean().optional().default(false)
});

function createHandler(program) {
  return async (req, res, next) => {
    try {
      const input = schema.parse(req.body);
      const item = await registerCommunity(program, input);
      res.status(201).json({
        id: item.id,
        code: item.code,
        program: item.program,
        status: item.status,
        createdAt: item.created_at
      });
    } catch (error) {
      if (error?.name === 'ZodError') {
        return next(new AppError('Thông tin đăng ký chưa hợp lệ.', 400, error.issues));
      }
      return next(error);
    }
  };
}

router.post('/we-hola', createHandler('WE_HOLA'));
router.post('/hola-day', createHandler('HOLA_DAY'));

export default router;
