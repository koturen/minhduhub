import MediaBrowser from '../components/media/MediaBrowser';
import { useI18n } from '../i18n';
export default function ImagesPage() { const { t } = useI18n(); return <MediaBrowser type="image" title={t('browse.images')} />; }
