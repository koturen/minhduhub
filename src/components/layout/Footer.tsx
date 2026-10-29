import { isCloudinaryConfigured } from '../../lib/cloudinary';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-4 text-xs text-muted">
      MinhDuHub {isCloudinaryConfigured ? '' : '· Demo mode: Cloudinary is not configured. '}
      {isSupabaseConfigured ? 'Uploads are shared through the database.' : 'Uploads saved in this build are stored only in your browser and are not shared across devices.'}
    </footer>
  );
}
