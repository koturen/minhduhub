export type MediaType = 'video' | 'image';
export type Visibility = 'public' | 'unlisted' | 'private';

export interface Media {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string; // ISO date
  ownerId?: string;
  visibility: Visibility;
  width?: number;
  height?: number;
  duration?: number; // seconds, videos only
  cloudinaryPublicId?: string;
  resourceType: 'image' | 'video';
  format?: string;
  allowDownload?: boolean;
}
