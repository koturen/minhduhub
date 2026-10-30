import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { loginSchema, type LoginValues } from '../lib/validation';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (v: LoginValues) => {
    setError('');
    try {
      await signIn(v.email, v.password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'err.upload');
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{t('auth.loginTitle')}</h1>
      {!isSupabaseConfigured && (
        <p role="alert" className="mb-4 flex gap-2 rounded-md border border-accent p-3 text-sm"><AlertTriangle className="shrink-0 text-accent" size={18} />{t('auth.needSupabase')}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm">{t('auth.email')}</label>
          <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
          {errors.email?.message && <p role="alert" className="mt-1 text-xs text-danger">{t(errors.email.message)}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm">{t('auth.password')}</label>
          <input id="password" type="password" autoComplete="current-password" className="input" {...register('password')} />
          {errors.password?.message && <p role="alert" className="mt-1 text-xs text-danger">{t(errors.password.message)}</p>}
        </div>
        {error && <p role="alert" className="text-sm text-danger">{t(error)}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !isSupabaseConfigured}>{t('auth.loginTitle')}</button>
      </form>
      <p className="mt-4 text-sm text-muted">{t('auth.noAccount')} <Link to="/register" className="text-accent hover:underline">{t('nav.register')}</Link></p>
    </div>
  );
}
