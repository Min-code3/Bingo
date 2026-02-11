'use client';

import React from 'react';
import Link from 'next/link';
import { useBingoState } from '@/components/useBingoState';
import { useI18n } from '@/components/I18nProvider';
import { CITIES } from '@/lib/constants';
import HiddenPiece from '@/components/HiddenPiece';

export default function PicturePage() {
  const { state, hydrated, cityId, cellImages } = useBingoState();
  const { t } = useI18n();
  const mainCells = CITIES[cityId]?.mainCells ?? [];

  if (!hydrated) {
    return (
      <>
        <Link href="/" className="back-btn">{t('picture.back')}</Link>
        <h2 className="page-title">{t('picture.title')}</h2>
        <p className="page-subtitle">{t('main.loading')}</p>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="back-btn">{t('picture.back')}</Link>
      <h2 className="page-title" style={{ color: '#D4A574' }}>{t('picture.title')}</h2>
      <p className="page-subtitle">{t('picture.subtitle')}</p>

      <div className="picture-grid">
        {mainCells.map((cfg, idx) => {
          const cellState = state.main[cfg.id];
          const revealed = cellState?.done ?? false;
          const box = String(idx + 1);
          const hiddenImg = cellImages?.hidden[box];

          return (
            <div
              key={cfg.id}
              className={`picture-cell ${revealed ? 'revealed' : 'locked'}`}
            >
              {revealed && (hiddenImg
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={hiddenImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <HiddenPiece pp={cfg.pp} ps={cfg.ps} />
              )}
            </div>
          );
        })}
      </div>

      <Link href="/" className="picture-btn" style={{ marginTop: 20 }}>
        {t('picture.goBack')}
      </Link>
    </>
  );
}
