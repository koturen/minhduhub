import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { registerSchema, type RegisterValues } from '../lib/validation';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n';

export default function RegisterPage() {
  const { t } = useI18n();
  const { user, signUp } = useAuth();
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (v: RegisterValues) => {
    setError('');
    try {
      const { needsConfirm } = await signUp(v.email, v.password);
      setCheckEmail(needsConfirm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'err.upload');
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{t('auth.registerTitle')}</h1>
      {!isSupabaseConfigured && (
        <p role="alert" className="mb-4 flex gap-2 rounded-md border border-accent p-3 text-sm"><AlertTriangle className="shrink-0 text-accent" size={18} />{t('auth.needSupabase')}</p>
      )}
      {checkEmail ? (
        <p role="status" className="rounded-md border border-ok p-4 text-sm">{t('auth.checkEmail')}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm">{t('auth.email')}</label>
            <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
            {errors.email?.message && <p role="alert" className="mt-1 text-xs text-danger">{t(errors.email.message)}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm">{t('auth.password')}</label>
            <input id="password" type="password" autoComplete="new-password" className="input" {...register('password')} />
            {errors.password?.message && <p role="alert" className="mt-1 text-xs text-danger">{t(errors.password.message)}</p>}
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm">{t('auth.confirm')}</label>
            <input id="confirm" type="password" autoComplete="new-password" className="input" {...register('confirm')} />
            {errors.confirm?.message && <p role="alert" className="mt-1 text-xs text-danger">{t(errors.confirm.message)}</p>}
          </div>
          {error && <p role="alert" className="text-sm text-danger">{t(error)}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !isSupabaseConfigured}>{t('auth.registerTitle')}</button>
        </form>
      )}
      <p className="mt-4 text-sm text-muted">{t('auth.haveAccount')} <Link to="/login" className="text-accent hover:underline">{t('nav.login')}</Link></p>
    </div>
  );
}
