'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useBingoState } from '@/components/useBingoState';
import { useI18n } from '@/components/I18nProvider';
import { CITIES } from '@/lib/constants';
import { countFoodLines, isFoodBingoComplete } from '@/lib/bingo-logic';
import BingoCell from '@/components/BingoCell';
import Notification from '@/components/Notification';

export default function FoodPage() {
  const { state, hydrated, cityId, cellImages, userId, uploadFood } = useBingoState();
  const { t } = useI18n();
  const [notification, setNotification] = useState<string | null>(null);

  const city = CITIES[cityId];
  const foodCells = city?.foodCells ?? [];
  const foodLines = countFoodLines(state);
  const foodComplete = isFoodBingoComplete(state);

  const handleUpload = useCallback((index: number, photo: string) => {
    uploadFood(index, photo);
    const newFood = [...state.food];
    newFood[index] = { done: true, photo };
    if (isFoodBingoComplete({ ...state, food: newFood }) && !isFoodBingoComplete(state)) {
      setTimeout(() => setNotification(t('food.notification')), 1500);
    }
  }, [uploadFood, state, t]);

  if (!hydrated) {
    return (
      <>
        <Link href="/" className="back-btn">{t('food.back')}</Link>
        <h2 className="page-title">{t('food.title')}</h2>
        <p className="page-subtitle">{t('main.loading')}</p>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="back-btn">{t('food.back')}</Link>
      <h2 className="page-title">{t('food.title')}</h2>
      <p className="page-subtitle">{t('food.subtitle')}</p>

      <div className="food-status">
        {t('food.status', { done: Math.min(foodLines, 8) })} {foodComplete ? '✅' : ''}
      </div>

      <div className="bingo-grid food-grid">
        {foodCells.map((cfg, i) => {
          const cellState = state.food[i];
          const box = String(i + 1);
          return (
            <BingoCell
              key={cfg.id}
              config={cfg}
              done={cellState?.done ?? false}
              photo={cellState?.photo ?? null}
              isBingoLine={false}
              onUpload={(photo) => handleUpload(i, photo)}
              placeUrl={`/place/${cfg.id}`}
              sheetImage={cellImages?.food[box]}
              keepPhoto
              userId={userId}
            />
          );
        })}
      </div>

      <Notification message={notification} onDone={() => setNotification(null)} />
    </>
  );
}
