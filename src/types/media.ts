export type MediaType = 'video' | 'image';
export type Visibility = 'public' | 'unlisted' | 'private';

export interface Media {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  category: string;
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
  /** True for bundled sample records; never real uploads. */
  isDemo?: boolean;
}

export const CATEGORIES = ['Gaming', 'Animation', 'Technology', 'Photography', 'Entertainment'] as const;
export type Category = (typeof CATEGORIES)[number];
