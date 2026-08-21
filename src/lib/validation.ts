import { z } from 'zod';

// ─── Shared constants ────────────────────────────────────────────────────────

export const LEVELS = ['100', '200', '300', '400', '500', '600'] as const;

export const STUDENT_STATUSES = [
  { value: 'UTME_CANDIDATE', label: 'UTME / JAMB candidate' },
  { value: 'PROSPECTIVE', label: 'Prospective student (awaiting admission)' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'FINAL_YEAR', label: 'Final-year student' },
  { value: 'SIWES', label: 'SIWES / IT student' },
  { value: 'NYSC_TRANSITION', label: 'Graduate (NYSC transition)' }
] as const;

export const DEADLINE_TYPES = ['EXAM', 'TEST', 'ASSIGNMENT', 'PROJECT', 'REGISTRATION', 'FEE', 'SIWES', 'CLEARANCE', 'OTHER'] as const;

export const ANNOUNCEMENT_CATEGORIES = ['JAMB', 'ADMISSION', 'REGISTRATION', 'EXAMINATIONS', 'FEES', 'SIWES', 'RESULTS', 'OPPORTUNITY', 'GENERAL'] as const;

export const URGENCIES = ['URGENT', 'IMPORTANT', 'GENERAL'] as const;

export const VERIFICATION_STATUSES = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'OUTDATED', 'ARCHIVED'] as const;

export const RESOURCE_TYPES = ['PAST_QUESTION', 'LECTURE_NOTE', 'TEMPLATE', 'FORM', 'GUIDE', 'OTHER'] as const;

export const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

// ─── Schemas ────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password is too long.'),
  phone: z.string().trim().max(20).optional().or(z.literal(''))
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.').max(72)
});

export const profileSchema = z.object({
  institutionId: z.string().trim().max(64).optional().or(z.literal('')),
  facultyId: z.string().trim().max(64).optional().or(z.literal('')),
  departmentId: z.string().trim().max(64).optional().or(z.literal('')),
  level: z.enum(LEVELS).optional().or(z.literal('')),
  programme: z.string().trim().max(120).optional().or(z.literal('')),
  semester: z.enum(['FIRST', 'SECOND']).optional().or(z.literal('')),
  currentCgpa: z.coerce.number().min(0, 'CGPA cannot be negative.').max(7, 'CGPA cannot exceed 7.').optional().nullable(),
  studentStatus: z.string().trim().max(40).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal(''))
});

export const deadlineSchema = z.object({
  type: z.enum(DEADLINE_TYPES),
  title: z.string().trim().min(2, 'Please give it a title.').max(200),
  course: z.string().trim().max(60).optional().or(z.literal('')),
  dueAt: z.string().trim().min(4, 'Please pick a date.'),
  time: z.string().trim().max(10).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  priority: z.enum(PRIORITIES).default('MEDIUM'),
  remindDays: z.coerce.number().int().min(0).max(60).default(2)
});

export const deadlinePatchSchema = deadlineSchema.partial().extend({
  status: z.enum(['PENDING', 'COMPLETED', 'MISSED']).optional()
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, 'Please give the task a title.').max(200),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  dueAt: z.string().trim().optional().or(z.literal(''))
});

export const documentSchema = z.object({
  templateKey: z.string().trim().min(2).max(60),
  title: z.string().trim().min(2).max(200),
  values: z.record(z.string().max(4000)).default({})
});

export const bookmarkSchema = z.object({
  kind: z.enum(['ANNOUNCEMENT', 'PAGE', 'RESOURCE', 'LETTER']),
  title: z.string().trim().min(1).max(300),
  url: z.string().trim().min(1).max(500)
});

export const announcementSchema = z.object({
  title: z.string().trim().min(4, 'Title is too short.').max(300),
  summary: z.string().trim().min(4, 'Summary is too short.').max(500),
  body: z.string().trim().min(10, 'Body is too short.').max(20000),
  category: z.enum(ANNOUNCEMENT_CATEGORIES),
  urgency: z.enum(URGENCIES).default('GENERAL'),
  status: z.enum(VERIFICATION_STATUSES).default('DRAFT' as never).optional(),
  institutionId: z.string().trim().max(64).optional().or(z.literal('')),
  sourceName: z.string().trim().min(2, 'Source is required.').max(200),
  sourceUrl: z.string().trim().url('Source URL must be a valid URL.').max(500).optional().or(z.literal('')),
  effectiveDate: z.string().trim().max(40).optional().or(z.literal(''))
});

export const cutoffSchema = z.object({
  institutionId: z.string().trim().min(1, 'Institution is required.').max(64),
  programme: z.string().trim().min(2, 'Programme is required.').max(200),
  faculty: z.string().trim().max(200).optional().or(z.literal('')),
  utmeCutoff: z.coerce.number().int().min(0, 'Cut-off cannot be negative.').max(400, 'UTME cut-off cannot exceed 400.').optional().nullable(),
  departmentalCutoff: z.coerce.number().min(0).max(100).optional().nullable(),
  session: z.string().trim().min(4, 'Session is required, e.g. 2025/2026.').max(20),
  category: z.enum(['UTME', 'DEPARTMENTAL', 'POST_UTME']).default('UTME'),
  sourceName: z.string().trim().min(2, 'Source is required.').max(200),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
  note: z.string().trim().max(1000).optional().or(z.literal(''))
});

export const reportSchema = z.object({
  reason: z.string().trim().min(4, 'Please describe the problem.').max(1000)
});

export const rolePatchSchema = z.object({
  role: z.enum(['STUDENT', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional()
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.')
});

export const passwordResetSchema = z.object({
  token: z.string().trim().min(10),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72)
});

export const notificationPrefsSchema = z.object({
  notifyEmail: z.boolean(),
  notifyInApp: z.boolean()
});

// ─── Upload constraints (§28) ────────────────────────────────────────────────

export const RESOURCE_UPLOAD = {
  maxBytes: 5 * 1024 * 1024, // 5 MB
  allowed: new Map<string, string>([
    ['pdf', 'application/pdf'],
    ['doc', 'application/msword'],
    ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png']
  ])
};
