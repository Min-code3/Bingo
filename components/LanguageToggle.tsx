'use client';

import React from 'react';
import { useI18n } from './I18nProvider';

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  const toggle = () => setLang(lang === 'en' ? 'ko' : 'en');

  return (
    <button className="lang-toggle-btn" onClick={toggle} aria-label="Toggle language">
      <span className="lang-toggle-icon">🌐</span>
      <span className="lang-toggle-label" suppressHydrationWarning>
        {lang === 'en' ? 'EN' : 'KO'}
      </span>
    </button>
  );
}
