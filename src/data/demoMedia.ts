import type { Media } from '../types/media';
import { imageThumb, imageUrl, videoPoster, videoUrl } from '../lib/mediaUrls';

// Sample records served from Cloudinary's public "demo" cloud. They are NOT user uploads.
const DEMO = 'demo';

const video = (id: string, title: string, publicId: string, category: string, duration: number, createdAt: string, tags: string[]): Media => ({
  id, title: `[Sample] ${title}`, type: 'video', resourceType: 'video', category, tags, createdAt, duration,
  description: 'Sample video from the Cloudinary demo cloud, shown so the interface looks complete before real uploads exist.',
  url: videoUrl(DEMO, publicId), thumbnailUrl: videoPoster(DEMO, publicId), visibility: 'public',
  cloudinaryPublicId: publicId, isDemo: true,
});

const image = (id: string, title: string, publicId: string, category: string, createdAt: string, tags: string[]): Media => ({
  id, title: `[Sample] ${title}`, type: 'image', resourceType: 'image', category, tags, createdAt,
  description: 'Sample image from the Cloudinary demo cloud, shown so the interface looks complete before real uploads exist.',
  url: imageUrl(DEMO, publicId), thumbnailUrl: imageThumb(DEMO, publicId), visibility: 'public',
  cloudinaryPublicId: publicId, isDemo: true,
});

export const demoMedia: Media[] = [
  video('demo-v1', 'Dog on a walk', 'dog', 'Entertainment', 14, '2026-09-20T10:00:00Z', ['animals', 'outdoors']),
  video('demo-v2', 'Elephants at the waterhole', 'elephants', 'Photography', 22, '2026-09-12T10:00:00Z', ['wildlife', 'nature']),
  video('demo-v3', 'Pixel arena highlights', 'dog', 'Gaming', 14, '2026-08-30T10:00:00Z', ['highlights']),
  video('demo-v4', 'Short animated loop', 'elephants', 'Animation', 22, '2026-08-18T10:00:00Z', ['loop', 'motion']),
  video('demo-v5', 'Gadget teardown teaser', 'dog', 'Technology', 14, '2026-08-02T10:00:00Z', ['hardware']),
  video('demo-v6', 'Backstage reel', 'elephants', 'Entertainment', 22, '2026-07-21T10:00:00Z', ['reel']),
  image('demo-i1', 'Sample landscape', 'sample', 'Photography', '2026-09-25T10:00:00Z', ['landscape']),
  image('demo-i2', 'Sample still life', 'cld-sample', 'Photography', '2026-09-14T10:00:00Z', ['still-life']),
  image('demo-i3', 'Sample portrait study', 'cld-sample-2', 'Photography', '2026-09-01T10:00:00Z', ['portrait']),
  image('demo-i4', 'Sample product shot', 'cld-sample-3', 'Technology', '2026-08-15T10:00:00Z', ['product']),
  image('demo-i5', 'Sample concept art', 'sample', 'Animation', '2026-07-30T10:00:00Z', ['concept']),
  image('demo-i6', 'Sample game screenshot', 'cld-sample', 'Gaming', '2026-07-10T10:00:00Z', ['screenshot']),
];
