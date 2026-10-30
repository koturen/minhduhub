import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">{t('notfound.title')}</h1>
      <p className="mb-6 text-muted">{t('notfound.text')}</p>
      <Link to="/" className="btn btn-primary">{t('common.backHome')}</Link>
    </div>
  );
}
