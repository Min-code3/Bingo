'use client';

import React, { useState } from 'react';
import { useBingoState } from './useBingoState';
import { useI18n } from './I18nProvider';
import { getMainProgress, countMainLines, getPictureProgress } from '@/lib/bingo-logic';
import { CITIES } from '@/lib/constants';
import { cityLabel } from '@/lib/i18n';

export default function Sidebar() {
  const { state, hydrated, cityId, setCityId, reset } = useBingoState();
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mainProg = getMainProgress(state, cityId);
  const bingoLines = countMainLines(state, cityId);
  const picProg = getPictureProgress(state, cityId);

  const handleReset = () => {
    if (confirm(t('sidebar.confirmReset'))) reset();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <h1 className="sidebar-title" suppressHydrationWarning>
          {mounted ? t('sidebar.title') : 'Travel Bingo'}
        </h1>

        {/* City Selector */}
        <div className="sidebar-city-selector">
          {Object.values(CITIES).map(city => (
            <button
              key={city.id}
              className={`sidebar-city-option ${cityId === city.id ? 'active' : ''}`}
              onClick={() => setCityId(city.id)}
              suppressHydrationWarning
            >
              <span className="sidebar-city-radio" />
              <span className="sidebar-city-label">{mounted ? cityLabel(city.id, lang) : cityLabel(city.id, 'en')}</span>
            </button>
          ))}
        </div>

        <div className="progress-section">
          <div className="progress-item">
            <span className="progress-label-title" suppressHydrationWarning>
              {mounted ? t('sidebar.mainProgress') : 'Main Progress'}
            </span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: hydrated ? `${(mainProg.done / mainProg.total) * 100}%` : '0%' }} />
            </div>
            <span className="progress-label">{mainProg.done} / {mainProg.total}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label-title" suppressHydrationWarning>
              {mounted ? t('sidebar.bingoLines') : 'Bingo Lines'}
            </span>
            <span className="progress-label" suppressHydrationWarning>
              {mounted ? t('sidebar.bingoLinesValue', { n: bingoLines }) : `${bingoLines} lines`}
            </span>
          </div>
          <div className="progress-item">
            <span className="progress-label-title" suppressHydrationWarning>
              {mounted ? t('sidebar.hiddenPicture') : 'Hidden Picture'}
            </span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: hydrated ? `${(picProg.done / picProg.total) * 100}%` : '0%' }} />
            </div>
            <span className="progress-label">{picProg.done} / {picProg.total}</span>
          </div>
        </div>
        <button className="reset-btn" onClick={handleReset} suppressHydrationWarning>
          {mounted ? t('sidebar.reset') : 'Reset'}
        </button>
        <div className="sidebar-lang">
          <button className={`lang-option${mounted && lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')} suppressHydrationWarning>English</button>
          <button className={`lang-option${mounted && lang === 'ko' ? ' active' : ''}`} onClick={() => setLang('ko')} suppressHydrationWarning>한국어</button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <h1 suppressHydrationWarning>
          {mounted ? t('main.bingo', { city: cityLabel(cityId, lang) }) : `Travel Bingo - ${cityLabel(cityId, 'en')}`}
        </h1>
        <div className="mobile-progress">
          <span>{mainProg.done}/{mainProg.total}</span>
          <span suppressHydrationWarning>
            {mounted ? t('sidebar.bingoLinesValue', { n: bingoLines }) : `${bingoLines} lines`}
          </span>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <h3 suppressHydrationWarning>{mounted ? t('sidebar.citySelect') : 'Select City'}</h3>
            <div className="mobile-city-selector">
              {Object.values(CITIES).map(city => (
                <button
                  key={city.id}
                  className={`mobile-city-option ${cityId === city.id ? 'active' : ''}`}
                  onClick={() => { setCityId(city.id); setMenuOpen(false); }}
                  suppressHydrationWarning
                >
                  <span className="mobile-city-radio" />
                  <span className="mobile-city-label">{mounted ? cityLabel(city.id, lang) : cityLabel(city.id, 'en')}</span>
                </button>
              ))}
            </div>
            <button className="mobile-menu-item reset" onClick={() => { handleReset(); setMenuOpen(false); }} suppressHydrationWarning>
              {mounted ? t('sidebar.reset') : 'Reset'}
            </button>
            <div className="mobile-lang-selector">
              <button className={`mobile-lang-option${mounted && lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')} suppressHydrationWarning>English</button>
              <button className={`mobile-lang-option${mounted && lang === 'ko' ? ' active' : ''}`} onClick={() => setLang('ko')} suppressHydrationWarning>한국어</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
