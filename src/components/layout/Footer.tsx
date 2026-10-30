import { isSupabaseConfigured } from '../../lib/supabase';
import { useI18n } from '../../i18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line bg-surface px-4 py-4 text-xs text-muted">
      MinhDuHub · {isSupabaseConfigured ? t('footer.shared') : t('footer.local')}
    </footer>
  );
}
