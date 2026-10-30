import type { Media, MediaType } from '../types/media';
import { imageThumb, imageUrl, videoPoster, videoUrl } from './mediaUrls';

export const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || undefined;
export const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || undefined;
export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

export interface CloudinaryResponse {
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at?: string;
}

export interface UploadHandle {
  promise: Promise<CloudinaryResponse>;
  cancel: () => void;
}

/** Unsigned upload to Cloudinary with progress. No secrets are used or needed. */
export function uploadToCloudinary(file: File, onProgress: (percent: number) => void): UploadHandle {
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary is not configured.');
  const kind: MediaType = file.type.startsWith('video/') ? 'video' : 'image';
  const xhr = new XMLHttpRequest();
  const promise = new Promise<CloudinaryResponse>((resolve, reject) => {
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${kind}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as CloudinaryResponse & { error?: { message: string } };
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body.error?.message ?? 'err.upload'));
      } catch {
        reject(new Error('err.unreadable'));
      }
    };
    xhr.onerror = () => reject(new Error('err.network'));
    xhr.onabort = () => reject(new Error('err.cancelled'));
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);
    xhr.send(form);
  });
  return { promise, cancel: () => xhr.abort() };
}

export function toMediaRecord(
  res: CloudinaryResponse,
  meta: { title: string; description?: string; tags: string[]; allowDownload: boolean },
): Media {
  if (!cloudName) throw new Error('Cloudinary is not configured.');
  const isVideo = res.resource_type === 'video';
  return {
    id: crypto.randomUUID(),
    title: meta.title,
    description: meta.description,
    type: isVideo ? 'video' : 'image',
    resourceType: isVideo ? 'video' : 'image',
    url: isVideo ? videoUrl(cloudName, res.public_id) : imageUrl(cloudName, res.public_id),
    thumbnailUrl: isVideo ? videoPoster(cloudName, res.public_id) : imageThumb(cloudName, res.public_id),
    tags: meta.tags,
    createdAt: res.created_at ?? new Date().toISOString(),
    visibility: 'public',
    width: res.width,
    height: res.height,
    duration: res.duration,
    format: res.format,
    cloudinaryPublicId: res.public_id,
    allowDownload: meta.allowDownload,
  };
}
