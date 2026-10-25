// All Cloudinary delivery-URL construction lives here.
type Kind = 'image' | 'video';

const root = (cloud: string, kind: Kind) => `https://res.cloudinary.com/${encodeURIComponent(cloud)}/${kind}/upload`;
const path = (publicId: string) => publicId.split('/').map(encodeURIComponent).join('/');

export function imageUrl(cloud: string, publicId: string, width = 1600): string {
  return `${root(cloud, 'image')}/f_auto,q_auto,c_limit,w_${width}/${path(publicId)}`;
}

export function imageThumb(cloud: string, publicId: string, width = 480): string {
  const height = Math.round((width * 9) / 16);
  return `${root(cloud, 'image')}/f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}/${path(publicId)}`;
}

export function imageSrcSet(cloud: string, publicId: string): string {
  return [480, 800, 1200, 1600].map((w) => `${imageUrl(cloud, publicId, w)} ${w}w`).join(', ');
}

export function videoUrl(cloud: string, publicId: string): string {
  return `${root(cloud, 'video')}/f_auto,q_auto/${path(publicId)}`;
}

/** Poster frame taken from the video via Cloudinary (a JPG of the first frame). */
export function videoPoster(cloud: string, publicId: string, width = 480): string {
  const height = Math.round((width * 9) / 16);
  return `${root(cloud, 'video')}/so_0,f_jpg,q_auto,c_fill,g_auto,w_${width},h_${height}/${path(publicId)}.jpg`;
}
