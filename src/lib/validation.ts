import { z } from 'zod';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Returns a translation key for the problem, or null when the file is acceptable. */
export function validateFile(file: File): string | null {
  if (IMAGE_TYPES.includes(file.type)) return file.size > MAX_IMAGE_BYTES ? 'err.imageSize' : null;
  if (VIDEO_TYPES.includes(file.type)) return file.size > MAX_VIDEO_BYTES ? 'err.videoSize' : null;
  return 'err.type';
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

// Messages are translation keys; the UI passes them through t().
export const uploadFormSchema = z.object({
  description: z.string().max(500, 'err.description').optional(),
  tags: z.string().max(200, 'err.tags').optional(),
  allowDownload: z.boolean(),
});
export type UploadFormValues = z.infer<typeof uploadFormSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('err.email'),
  password: z.string().min(1, 'err.passwordRequired'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().trim().email('err.email'),
    password: z.string().min(8, 'err.passwordMin'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'err.passwordMatch' });
export type RegisterValues = z.infer<typeof registerSchema>;

export function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const tags = raw.split(',').map((t) => t.trim().toLowerCase().replace(/[^\p{L}\p{N}-]+/gu, '-')).filter(Boolean);
  return [...new Set(tags)].slice(0, 10);
}
