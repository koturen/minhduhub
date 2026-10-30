import MediaBrowser from '../components/media/MediaBrowser';
import { useI18n } from '../i18n';
export default function SearchPage() { const { t } = useI18n(); return <MediaBrowser title={t('browse.search')} />; }
