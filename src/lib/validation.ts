import { z } from 'zod';
import { CATEGORIES } from '../types/media';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file: File): string | null {
  if (IMAGE_TYPES.includes(file.type)) {
    return file.size > MAX_IMAGE_BYTES ? 'Images must be 10 MB or smaller.' : null;
  }
  if (VIDEO_TYPES.includes(file.type)) {
    return file.size > MAX_VIDEO_BYTES ? 'Videos must be 100 MB or smaller.' : null;
  }
  return 'Unsupported format. Use JPG, PNG, WebP, GIF, MP4, WebM or MOV.';
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export const uploadFormSchema = z.object({
  description: z.string().max(500, 'Keep the description under 500 characters.').optional(),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Choose a category.' }) }),
  tags: z.string().max(200, 'Keep tags under 200 characters.').optional(),
  allowDownload: z.boolean(),
});
export type UploadFormValues = z.infer<typeof uploadFormSchema>;

export function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const tags = raw.split(',').map((t) => t.trim().toLowerCase().replace(/[^\p{L}\p{N}-]+/gu, '-')).filter(Boolean);
  return [...new Set(tags)].slice(0, 10);
}
