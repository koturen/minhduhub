import MediaBrowser from '../components/media/MediaBrowser';
import { useI18n } from '../i18n';
export default function VideosPage() { const { t } = useI18n(); return <MediaBrowser type="video" title={t('browse.videos')} />; }
