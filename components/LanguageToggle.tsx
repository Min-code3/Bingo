'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from './I18nProvider';

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="landing-lang-selector">
      <button
        className={`landing-lang-option${mounted && lang === 'en' ? ' active' : ''}`}
        onClick={() => setLang('en')}
        suppressHydrationWarning
      >
        English
      </button>
      <button
        className={`landing-lang-option${mounted && lang === 'ko' ? ' active' : ''}`}
        onClick={() => setLang('ko')}
        suppressHydrationWarning
      >
        한국어
      </button>
    </div>
  );
}
