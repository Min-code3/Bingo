'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Lang, createT, UiKey } from '@/lib/i18n';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

const STORAGE_KEY = 'travel-bingo-lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangRaw] = useState<Lang>('en');

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ko') {
      setLangRaw(saved);
    }
  }, []);

  // Sync to localStorage + document lang
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangRaw(l);

  const t = useMemo(() => createT(lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
