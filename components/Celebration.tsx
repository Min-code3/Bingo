'use client';

import React, { useState, useEffect } from 'react';
import { useBingoState } from './useBingoState';
import { useI18n } from './I18nProvider';
import { CITIES } from '@/lib/constants';
import { cityLabel } from '@/lib/i18n';

export default function Celebration({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { cellImages, cityId } = useBingoState();
  const { lang, t } = useI18n();
  const [phase, setPhase] = useState<'split' | 'merge' | 'done'>('split');

  const mainCells = CITIES[cityId]?.mainCells ?? [];

  useEffect(() => {
    if (!show) { setPhase('split'); return; }
    const t1 = setTimeout(() => setPhase('merge'), 800);
    const t2 = setTimeout(() => setPhase('done'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;

  return (
    <div className="celebration-overlay" onClick={onClose}>
      <div className="celebration-content" onClick={e => e.stopPropagation()}>
        <h2 className="celebration-title">
          {phase === 'done' ? t('celebration.title') : t('celebration.revealing')}
        </h2>

        <div className={`celebration-grid phase-${phase}`}>
          {mainCells.map((cfg, idx) => {
            const box = String(idx + 1);
            const img = cellImages?.hidden[box];
            return (
              <div key={cfg.id} className="celebration-piece">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" />
                )}
              </div>
            );
          })}
        </div>

        {phase === 'done' && (
          <>
            <p className="celebration-sub">{t('celebration.congrats', { city: cityLabel(cityId, lang) })}</p>
            <button className="celebration-close" onClick={onClose}>{t('celebration.close')}</button>
          </>
        )}
      </div>
      {phase === 'done' && <div className="confetti" />}
    </div>
  );
}
