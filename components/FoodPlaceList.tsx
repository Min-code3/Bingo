'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { useBingoState } from '@/components/useBingoState';
import { logEventWithBeacon, nowTokyo } from '@/lib/logger';
import { CELL_TO_MENU } from '@/lib/i18n';
import type { FoodPlace } from '@/lib/sheets';

interface Props {
  cellId: string;
  cityId: string;
}

export default function FoodPlaceList({ cellId, cityId }: Props) {
  const { lang, t } = useI18n();
  const { userId } = useBingoState();
  const [places, setPlaces] = useState<FoodPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const menu = CELL_TO_MENU[cellId];

  // Handler for Google Maps link clicks
  const handleMapClick = async (e: React.MouseEvent<HTMLAnchorElement>, placeName: string, url: string) => {
    // Log the external link click with beacon before navigation
    await logEventWithBeacon(userId, {
      action_type: 'google_maps_click',
      target: placeName,
      element_type: 'a',
      element_text: t('food.openMap'),
      metadata: {
        restaurant_name: placeName,
        cell_id: cellId,
        map_url: url,
        timestamp: nowTokyo(),
      },
    });
    // Link will navigate naturally after this
  };

  useEffect(() => {
    if (!menu) return;
    fetch('/api/food-info')
      .then(r => r.json())
      .then((all: FoodPlace[]) => {
        const filtered = all
          .filter(p => p.area === cityId && p.menu === menu)
          .sort((a, b) => a.priority - b.priority);
        setPlaces(filtered);
      })
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [menu, cityId]);

  if (!menu) return null;
  if (loading) return null;
  if (places.length === 0) return null;

  return (
    <div className="food-place-list">
      <h3 className="food-place-list-title">{t('food.recommended')}</h3>

      <div className="food-place-cards">
        {places.map((p, i) => {
          const name = lang === 'ko' ? p.nameKr : p.nameEn;
          const desc = lang === 'ko' ? p.descKr : p.descEn;
          const closed = lang === 'ko' ? p.closedKr : p.closedEn;
          const floor = lang === 'ko' ? p.floorKr : p.floorEn;

          return (
            <div key={i} className="food-place-card">
              <div className="food-place-name">{name}</div>

              {(closed || floor) && (
                <div className="food-place-meta">
                  {closed && (
                    <div className="food-place-meta-row">
                      <span className="food-place-meta-label">{t('food.closedDay')}</span>
                      <span className="food-place-meta-value">{closed}</span>
                    </div>
                  )}
                  {floor && (
                    <div className="food-place-meta-row">
                      <span className="food-place-meta-label">{t('food.floor')}</span>
                      <span className="food-place-meta-value">{floor}</span>
                    </div>
                  )}
                </div>
              )}

              {desc && <p className="food-place-desc">{desc}</p>}

              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="food-place-map-btn"
                  onClick={(e) => handleMapClick(e, name, p.url!)}
                  data-restaurant={name}
                >
                  {t('food.openMap')} &rarr;
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
