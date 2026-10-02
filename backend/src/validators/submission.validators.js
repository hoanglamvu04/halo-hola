import { z } from 'zod';

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(160),
  displayName: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(60).optional().or(z.literal('')),
  bio: z.string().trim().max(1000).optional().or(z.literal('')),
  type: z.string().trim().min(1).max(80),
  theme: z.string().trim().min(1).max(180),
  color: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().min(2).max(255),
  story: z.string().trim().min(20).max(5000),
  allowMediaUse: z.union([z.boolean(), z.string()]).optional(),
  allowNewsletter: z.union([z.boolean(), z.string()]).optional()
});

export const statusSchema = z.object({
  status: z.enum(['PENDING', 'VALID', 'SHORTLIST', 'TOP52', 'AWARDED', 'REJECTED'])
});
