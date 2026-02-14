'use client';

import React, { useState } from 'react';
import { useBingoState } from './useBingoState';
import { useI18n } from './I18nProvider';
import { getMainProgress, countMainLines, getPictureProgress } from '@/lib/bingo-logic';
import { CITIES } from '@/lib/constants';
import { cityLabel } from '@/lib/i18n';

export default function Sidebar() {
  const { state, hydrated, cityId, setCityId, reset } = useBingoState();
  const { lang, t } = useI18n();
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
        <nav className="sidebar-nav">
          {Object.values(CITIES).map(city => (
            <button
              key={city.id}
              className={`nav-btn ${cityId === city.id ? 'active' : ''}`}
              onClick={() => setCityId(city.id)}
            >
              {cityLabel(city.id, lang)}
            </button>
          ))}
        </nav>
        <div className="progress-section">
          <div className="progress-item">
            <span className="progress-label-title">{t('sidebar.mainProgress')}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: hydrated ? `${(mainProg.done / mainProg.total) * 100}%` : '0%' }} />
            </div>
            <span className="progress-label">{mainProg.done} / {mainProg.total}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label-title">{t('sidebar.bingoLines')}</span>
            <span className="progress-label">{t('sidebar.bingoLinesValue', { n: bingoLines })}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label-title">{t('sidebar.hiddenPicture')}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: hydrated ? `${(picProg.done / picProg.total) * 100}%` : '0%' }} />
            </div>
            <span className="progress-label">{picProg.done} / {picProg.total}</span>
          </div>
        </div>
        <button className="reset-btn" onClick={handleReset}>{t('sidebar.reset')}</button>
      </aside>

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <h1>{t('main.bingo', { city: cityLabel(cityId, lang) })}</h1>
        <div className="mobile-progress">
          <span>{mainProg.done}/{mainProg.total}</span>
          <span>{t('sidebar.bingoLinesValue', { n: bingoLines })}</span>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <h3>{t('sidebar.citySelect')}</h3>
            {Object.values(CITIES).map(city => (
              <button
                key={city.id}
                className={`mobile-menu-item ${cityId === city.id ? 'active' : ''}`}
                onClick={() => { setCityId(city.id); setMenuOpen(false); }}
              >
                {cityLabel(city.id, lang)}
              </button>
            ))}
            <button className="mobile-menu-item reset" onClick={() => { handleReset(); setMenuOpen(false); }}>
              {t('sidebar.reset')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
