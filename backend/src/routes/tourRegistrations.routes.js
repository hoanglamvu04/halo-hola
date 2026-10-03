import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';
import { registerTour } from '../services/tourRegistration.service.js';

const router = Router();
const schema = z.object({
  tourNumber: z.string().trim().min(1).max(20),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(8).max(60),
  roleLabel: z.string().trim().max(120).optional().or(z.literal('')),
  equipment: z.string().trim().max(220).optional().or(z.literal('')),
  note: z.string().trim().max(1200).optional().or(z.literal(''))
});

router.post('/', async (req, res, next) => {
  try {
    const input = schema.parse(req.body);
    const item = await registerTour(input);
    res.status(201).json({
      id: item.id,
      code: item.code,
      status: item.status,
      tourNumber: item.tour_number,
      createdAt: item.created_at
    });
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Thông tin đăng ký tour chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;
