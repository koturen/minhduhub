import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { vi } from './vi';
import { en } from './en';

export type Lang = 'vi' | 'en';
const dicts: Record<Lang, Record<string, string>> = { vi, en };
const KEY = 'minhduhub:lang';

interface I18n {
  lang: Lang;
  locale: string;
  setLang: (l: Lang) => void;
  /** Unknown keys are returned as-is, so raw server messages pass through. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}
const Ctx = createContext<I18n | null>(null);

function initialLang(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'vi' || v === 'en') return v;
  } catch { /* ignore */ }
  return 'vi';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  }, []);
  const value = useMemo<I18n>(() => ({
    lang, setLang, locale: lang === 'vi' ? 'vi-VN' : 'en-US',
    t: (key, vars) => {
      const raw = dicts[lang][key] ?? key;
      return vars ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')) : raw;
    },
  }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside I18nProvider');
  return v;
}
