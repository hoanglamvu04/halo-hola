import { z } from 'zod';

const boolish = z.union([z.boolean(), z.string()]).optional();

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(160),
  displayName: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(60).optional().or(z.literal('')),
  bio: z.string().trim().max(1000).optional().or(z.literal('')),
  title: z.string().trim().min(2).max(280),
  capturedAt: z.string().trim().max(30).optional().or(z.literal('')),
  externalLink: z.string().trim().url().max(1000).optional().or(z.literal('')),
  previousAward: boolish,
  previousAwardNote: z.string().trim().max(1200).optional().or(z.literal('')),
  rightsConfirmed: boolish,
  imageConsentConfirmed: boolish,
  isMinor: boolish,
  guardianName: z.string().trim().max(180).optional().or(z.literal('')),
  guardianConsent: boolish,
  type: z.string().trim().min(1).max(80),
  theme: z.string().trim().min(1).max(180),
  color: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().min(2).max(255),
  story: z.string().trim().min(20).max(5000),
  allowMediaUse: boolish,
  allowNewsletter: boolish
}).superRefine((value, ctx) => {
  const truthy = (x) => x === true || String(x).toLowerCase() === 'true';

  if (!truthy(value.rightsConfirmed)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rightsConfirmed'], message: 'Cần xác nhận quyền tác giả.' });
  }

  if (truthy(value.isMinor) && (!value.guardianName || !truthy(value.guardianConsent))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianConsent'], message: 'Người dưới 18 tuổi cần xác nhận của người giám hộ.' });
  }
});

export const lookupSchema = z.object({
  code: z.string().trim().min(5).max(32),
  email: z.string().trim().email().max(255)
});

export const statusSchema = z.object({
  status: z.enum(['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED'])
});

export const juryNoteSchema = z.object({
  note: z.string().trim().max(4000)
});
