'use client';

import React, { useEffect, useRef } from 'react';
import { CellConfig } from '@/lib/types';
import { MainPlace, FoodPlace } from '@/lib/sheets';
import { useI18n } from './I18nProvider';
import { cellLabel, cellDescription } from '@/lib/i18n';
import UploadButton from './UploadButton';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  config: CellConfig | null;
  dbData: MainPlace | FoodPlace | null;
  category: 'main' | 'food';
  photo: string | null;
  onUpload: (photo: string) => void;
  userId?: string;
  foodRestaurants?: Array<{
    name: string;
    nameLocal: string;
    description: string;
    mapQuery: string;
  }>;
}

export default function BottomSheet({
  isOpen,
  onClose,
  config,
  dbData,
  category,
  photo,
  onUpload,
  userId,
  foodRestaurants = [],
}: BottomSheetProps) {
  const { lang } = useI18n();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Helper to check if dbData is MainPlace
  const isMainPlace = (data: MainPlace | FoodPlace | null): data is MainPlace => {
    return data !== null && 'id' in data;
  };

  // Helper to check if dbData is FoodPlace
  const isFoodPlace = (data: MainPlace | FoodPlace | null): data is FoodPlace => {
    return data !== null && 'menu' in data;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!config) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
          <div className="bottom-sheet-handle" />

          {/* 0. 가장 상단 우측: 사진 업로드 버튼 */}
          <div className="bottom-sheet-header">
            <UploadButton
              hasPhoto={!!photo}
              onUpload={(p) => {
                onUpload(p);
                setTimeout(() => onClose(), 300);
              }}
              userId={userId}
              uploadPrefix={category === 'food' ? 'food' : 'main'}
              label={photo ? '📷 Replace Photo' : '📷 Upload Photo'}
            />
          </div>

          {/* 1. 이미지 (모두 동일사이즈, 병렬노출) - DB 이미지만 표시 */}
          <div className="bottom-sheet-images">
            {/* MainPlace 이미지 */}
            {dbData && isMainPlace(dbData) && dbData.image1 && (
              <div className="bottom-sheet-image-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dbData.image1} alt={lang === 'en' ? dbData.name : dbData.nameKr} />
              </div>
            )}
            {dbData && isMainPlace(dbData) && dbData.image2 && (
              <div className="bottom-sheet-image-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dbData.image2} alt={lang === 'en' ? dbData.name : dbData.nameKr} />
              </div>
            )}
            {/* FoodPlace 이미지 */}
            {dbData && isFoodPlace(dbData) && dbData.imageUrl && (
              <div className="bottom-sheet-image-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dbData.imageUrl} alt={lang === 'en' ? dbData.nameEn : dbData.nameKr} />
              </div>
            )}
            {/* Fallback to config.image if no DB data */}
            {!dbData && config.image && (
              <div className="bottom-sheet-image-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.image} alt={cellLabel(config, lang)} />
              </div>
            )}
          </div>

          {/* 2. name (영어면 name, 한글이면 name_kr) */}
          <h3 className="bottom-sheet-name">
            {dbData && isMainPlace(dbData)
              ? (lang === 'en' ? dbData.name : dbData.nameKr)
              : dbData && isFoodPlace(dbData)
              ? (lang === 'en' ? dbData.nameEn : dbData.nameKr)
              : cellLabel(config, lang)}
          </h3>

          {/* 3. desc (설명, 네모 박스로 가독성 향상) */}
          {(() => {
            // MainPlace: 여러 desc 수집
            if (dbData && isMainPlace(dbData)) {
              const descs = lang === 'en'
                ? [dbData.desc1En, dbData.desc2En, dbData.desc3En, dbData.desc4En]
                : [dbData.desc1Kr, dbData.desc2Kr, dbData.desc3Kr, dbData.desc4Kr];

              const nonEmptyDescs = descs.filter(d => d && d.trim());

              if (nonEmptyDescs.length > 0) {
                return (
                  <div className="bottom-sheet-desc-box">
                    {nonEmptyDescs.map((desc, idx) => (
                      <div key={idx}>✅ {desc}</div>
                    ))}
                  </div>
                );
              }
            }

            // FoodPlace: single desc
            if (dbData && isFoodPlace(dbData)) {
              const desc = lang === 'en' ? dbData.descEn : dbData.descKr;
              if (desc && desc.trim()) {
                return (
                  <div className="bottom-sheet-desc-box">
                    {desc}
                  </div>
                );
              }
            }

            // Fallback to config description
            if (cellDescription(config, lang)) {
              return (
                <div className="bottom-sheet-desc-box">
                  {cellDescription(config, lang)}
                </div>
              );
            }

            return null;
          })()}

          {/* Food 카테고리: 식당 리스트 */}
          {category === 'food' && foodRestaurants.length > 0 && (
            <div className="bottom-sheet-restaurants">
              <h4 className="bottom-sheet-restaurants-title">
                {lang === 'en' ? 'Recommended Restaurants' : '추천 식당'}
              </h4>
              {foodRestaurants.map((restaurant, idx) => (
                <div key={idx} className="bottom-sheet-restaurant-item">
                  <div className="restaurant-name">
                    {lang === 'en' ? restaurant.name : restaurant.nameLocal || restaurant.name}
                  </div>
                  <div className="restaurant-description">{restaurant.description}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="restaurant-maps-link"
                  >
                    Google Map →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
