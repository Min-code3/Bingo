'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useBingoState } from '@/components/useBingoState';
import { useI18n } from '@/components/I18nProvider';
import { CITIES } from '@/lib/constants';
import { CellConfig } from '@/lib/types';
import { cellLabel, cellSub, cellDescription } from '@/lib/i18n';
import UploadButton from '@/components/UploadButton';
import FoodPlaceList from '@/components/FoodPlaceList';

export default function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, hydrated, cityId, userId, uploadMain, uploadFood } = useBingoState();
  const { lang, t } = useI18n();

  const city = CITIES[cityId];
  const mainCells = city?.mainCells ?? [];
  const foodCells = city?.foodCells ?? [];

  const mainCell = mainCells.find(c => c.id === id);
  const foodIndex = foodCells.findIndex(c => c.id === id);
  const foodCell = foodIndex >= 0 ? foodCells[foodIndex] : null;

  const config: CellConfig | undefined = mainCell || foodCell || undefined;

  if (!config) {
    return (
      <>
        <Link href="/" className="back-btn">{t('place.back')}</Link>
        <h2 className="page-title">{t('place.notFound')}</h2>
      </>
    );
  }

  const isFood = !!foodCell;
  const cellState = isFood ? state.food[foodIndex] : state.main[id];
  const backUrl = isFood ? '/food' : '/';
  const backLabel = isFood ? t('place.backFood') : t('place.backMain');

  const handleUpload = (photo: string) => {
    if (isFood) {
      uploadFood(foodIndex, photo);
    } else {
      uploadMain(id, photo);
    }
  };

  if (!hydrated) {
    return (
      <>
        <Link href={backUrl} className="back-btn">{backLabel}</Link>
        <p className="page-subtitle">{t('main.loading')}</p>
      </>
    );
  }

  const showRestaurants = isFood && id !== 'f-wild';
  const desc = cellDescription(config, lang);

  return (
    <div className="place-page">
      <Link href={backUrl} className="back-btn">{backLabel}</Link>

      {showRestaurants ? (
        <>
          <div className="place-header">
            <div className="place-icon">{config.icon}</div>
            <h2 className="place-title">{cellLabel(config, lang)}</h2>
          </div>
          <FoodPlaceList cellId={id} cityId={cityId} />
        </>
      ) : (
        <>
          <div className="place-header">
            <div className="place-icon">{config.icon}</div>
            <h2 className="place-title">{cellLabel(config, lang)}</h2>
            {cellSub(config, lang) && <p className="place-sub">{cellSub(config, lang)}</p>}
          </div>

          {desc && (
            <div className="place-desc">{desc}</div>
          )}

          <div className="place-upload-section">
            {cellState?.done && cellState.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cellState.photo} alt={cellLabel(config, lang)} className="place-photo-preview" />
            )}

            <UploadButton
              hasPhoto={!!cellState?.photo}
              onUpload={handleUpload}
              userId={userId}
              uploadPrefix={isFood ? 'food' : 'main'}
            />

            {cellState?.done && (
              <p style={{ color: '#78716C', fontSize: '0.85rem' }}>✅ {t('place.completed')}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
