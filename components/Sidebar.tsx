'use client';

import React, { useState } from 'react';
import { useBingoState } from './useBingoState';
import { useI18n } from './I18nProvider';
import { getMainProgress, countMainLines, getPictureProgress } from '@/lib/bingo-logic';
import { CITIES } from '@/lib/constants';
import { cityLabel } from '@/lib/i18n';

export default function Sidebar() {
  const { state, hydrated, cityId, setCityId, reset, freePhotos } = useBingoState();
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

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
              suppressHydrationWarning
            >
              {mounted ? cityLabel(city.id, lang) : cityLabel(city.id, 'en')}
            </button>
          ))}
        </nav>
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
        {/* Free photo album */}
        {freePhotos.length > 0 && (
          <div className="sidebar-album">
            <span className="sidebar-album-title" suppressHydrationWarning>
              {mounted ? t('free.album') : 'My Album'} ({freePhotos.length}/3)
            </span>
            <div className="sidebar-album-grid">
              {freePhotos.map((url, idx) => (
                <div key={idx} className="sidebar-album-item" onClick={() => setViewingPhoto(url)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* Photo viewer overlay */}
      {viewingPhoto && (
        <div className="photo-viewer-overlay" onClick={() => setViewingPhoto(null)}>
          <div className="photo-viewer-content" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto} alt="Photo" />
            <button className="photo-viewer-close" onClick={() => setViewingPhoto(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <h3 suppressHydrationWarning>{mounted ? t('sidebar.citySelect') : 'Select City'}</h3>
            {Object.values(CITIES).map(city => (
              <button
                key={city.id}
                className={`mobile-menu-item ${cityId === city.id ? 'active' : ''}`}
                onClick={() => { setCityId(city.id); setMenuOpen(false); }}
                suppressHydrationWarning
              >
                {mounted ? cityLabel(city.id, lang) : cityLabel(city.id, 'en')}
              </button>
            ))}
            {/* Mobile free photo album */}
            {freePhotos.length > 0 && (
              <div className="mobile-album">
                <span className="mobile-album-title" suppressHydrationWarning>
                  {mounted ? t('free.album') : 'My Album'} ({freePhotos.length}/3)
                </span>
                <div className="mobile-album-grid">
                  {freePhotos.map((url, idx) => (
                    <div key={idx} className="mobile-album-item" onClick={() => { setViewingPhoto(url); setMenuOpen(false); }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
