import { isCloudinaryConfigured } from '../../lib/cloudinary';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-4 text-xs text-muted">
      MinhDuHub {isCloudinaryConfigured ? '' : '· Demo mode: Cloudinary is not configured. '}
      Uploads saved in this build are stored only in your browser and are not shared across devices.
    </footer>
  );
}
