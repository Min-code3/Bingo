'use client';

import React, { useState, useCallback } from 'react';
import { useBingoState } from '@/components/useBingoState';
import { useI18n } from '@/components/I18nProvider';
import { CITIES, FOOD_ENTRANCE_IDS } from '@/lib/constants';
import { getBingoLineCells, getFoodProgress, isAllMainComplete, getMainProgress } from '@/lib/bingo-logic';
import { generateDummyPhoto } from '@/lib/image-utils';
import { cityLabel } from '@/lib/i18n';
import BingoCell from '@/components/BingoCell';
import FoodEntranceCell from '@/components/FoodEntranceCell';
import Notification from '@/components/Notification';
import Celebration from '@/components/Celebration';

export default function Home() {
  const { state, hydrated, cityId, cellImages, userId, uploadMain, uploadFood, reset } = useBingoState();
  const { lang, t } = useI18n();
  const [notification, setNotification] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const city = CITIES[cityId];
  const mainCells = city?.mainCells ?? [];
  const bingoLineCells = getBingoLineCells(state, cityId);
  const foodProgress = getFoodProgress(state);
  const mainProgress = getMainProgress(state, cityId);
  const pct = mainProgress.total > 0 ? Math.round((mainProgress.done / mainProgress.total) * 100) : 0;

  const handleUpload = useCallback((id: string, photo: string) => {
    uploadMain(id, photo);
    const nextState = { ...state, main: { ...state.main, [id]: { done: true, photo } } };
    if (isAllMainComplete(nextState, cityId)) {
      setTimeout(() => setShowCelebration(true), 1500);
    }
  }, [uploadMain, state, cityId]);

  if (!hydrated) {
    return (
      <>
        <h2 className="page-title">{t('main.bingo', { city: cityLabel(cityId, lang) })}</h2>
        <p className="page-subtitle">{t('main.loading')}</p>
      </>
    );
  }

  return (
    <>
      <h2 className="page-title">{t('main.bingo', { city: cityLabel(cityId, lang) })}</h2>
      <p className="page-subtitle">{t('main.subtitle')}</p>

      <div className={`bingo-grid${pct === 100 ? ' all-complete' : ''}`}>
        {mainCells.map((cfg, idx) => {
          const cellState = state.main[cfg.id];
          const isLine = bingoLineCells.has(cfg.id);
          const box = String(idx + 1);

          if (FOOD_ENTRANCE_IDS.includes(cfg.id)) {
            return (
              <FoodEntranceCell
                key={cfg.id}
                config={cfg}
                done={cellState?.done ?? false}
                isBingoLine={isLine}
                foodProgress={foodProgress}
                sheetImage={cellImages?.main[box]}
                hiddenImage={cellImages?.hidden[box]}
              />
            );
          }

          return (
            <BingoCell
              key={cfg.id}
              config={cfg}
              done={cellState?.done ?? false}
              photo={cellState?.photo ?? null}
              isBingoLine={isLine}
              onUpload={(photo) => handleUpload(cfg.id, photo)}
              placeUrl={`/place/${cfg.id}`}
              sheetImage={cellImages?.main[box]}
              hiddenImage={cellImages?.hidden[box]}
              userId={userId}
            />
          );
        })}
      </div>

      <div className="bottom-progress">
        <div className="bottom-progress-bar">
          <div className="bottom-progress-fill" style={{ width: `${pct}%` }} />
          <div className="bottom-progress-text">{pct}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className="small-reset-btn"
          onClick={() => { if (confirm(t('main.confirmReset'))) reset(); }}
        >
          {t('main.reset')}
        </button>
      </div>

      <Notification message={notification} onDone={() => setNotification(null)} />
      <Celebration show={showCelebration} onClose={() => setShowCelebration(false)} />
    </>
  );
}
