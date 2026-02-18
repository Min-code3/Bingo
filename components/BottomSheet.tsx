'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import Image from 'next/image';
import { CellConfig } from '@/lib/types';
import { MainPlace, FoodPlace } from '@/lib/sheets';
import { useI18n } from './I18nProvider';
import { cellLabel, cellDescription } from '@/lib/i18n';
import MultiPhotoUploadButton from './MultiPhotoUploadButton';
import PhotoGallery from './PhotoGallery';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  config: CellConfig | null;
  dbData: MainPlace | FoodPlace | null;
  category: 'main' | 'food';
  photos: string[];  // CHANGED: from photo to photos array
  onUpload: (photos: string[]) => void;  // CHANGED: accepts array
  onDeletePhoto?: (index: number) => void;  // NEW
  userId?: string;
  boxNumber?: number;
  foodRestaurants?: Array<{
    name: string;
    nameLocal: string;
    description: string;
    mapUrl: string;
    imageUrl?: string;
  }>;
}

export default function BottomSheet({
  isOpen,
  onClose,
  config,
  dbData,
  category,
  photos,  // CHANGED
  onUpload,
  onDeletePhoto,
  userId,
  boxNumber,
  foodRestaurants = [],
}: BottomSheetProps) {
  const { lang } = useI18n();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const cacheBuster = useMemo(() => `?v=${Date.now()}`, []);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const hasPhotos = photos.length > 0;
  const remainingSlots = Math.max(0, 3 - photos.length);

  // Helper to check if dbData is MainPlace
  const isMainPlace = (data: MainPlace | FoodPlace | null): data is MainPlace => {
    return data !== null && 'id' in data;
  };

  // Helper to check if dbData is FoodPlace
  const isFoodPlace = (data: MainPlace | FoodPlace | null): data is FoodPlace => {
    return data !== null && 'menu' in data;
  };

  // Handle body scroll lock
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

  // Handle browser back button
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      onClose();
    };

    // Push a dummy state when sheet opens
    window.history.pushState({ bottomSheet: true }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Remove dummy state if sheet is closed programmatically
      if (window.history.state?.bottomSheet) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!config) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStartY(touch.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const diff = touch.clientY - dragStartY;

    // Only allow dragging down
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Close if dragged more than 100px
    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleOverlayClick}
      >
        <div
          ref={sheetRef}
          className={`bottom-sheet ${isOpen ? 'open' : ''}`}
          style={{
            transform: isOpen
              ? `translateY(${dragOffset}px)`
              : 'translateY(100%)',
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bottom-sheet-handle" />

          {category === 'food' ? (
            /* ===== FOOD 바텀시트 ===== */
            <>
              {/* Photo Gallery */}
              {hasPhotos && (
                <div style={{ marginBottom: '16px' }}>
                  <PhotoGallery
                    photos={photos}
                    onDelete={onDeletePhoto}
                    editable={true}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <MultiPhotoUploadButton
                      remainingSlots={remainingSlots}
                      onUpload={(newPhotos) => {
                        onUpload(newPhotos);
                        if (newPhotos.length > 0) {
                          setTimeout(() => onClose(), 300);
                        }
                      }}
                      userId={userId}
                      uploadPrefix="food"
                      cellId={config?.id}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button (no photos yet) */}
              {!hasPhotos && (
                <div className="bottom-sheet-header">
                  <MultiPhotoUploadButton
                    remainingSlots={remainingSlots}
                    onUpload={(newPhotos) => {
                      onUpload(newPhotos);
                      if (newPhotos.length > 0) {
                        setTimeout(() => onClose(), 300);
                      }
                    }}
                    userId={userId}
                    uploadPrefix="food"
                    cellId={config?.id}
                  />
                </div>
              )}

              {/* 이모지 + 메뉴 이름 */}
              <div className="food-sheet-hero">
                <span className="food-sheet-emoji">🍽️</span>
                <h3 className="food-sheet-name">
                  {dbData && isFoodPlace(dbData)
                    ? (lang === 'en' ? dbData.menu : (dbData.menuKr || dbData.menu))
                    : cellLabel(config, lang)}
                </h3>
              </div>

              {/* 식당 리스트 */}
              {foodRestaurants.length > 0 && (
                <div className="food-sheet-list">
                  {foodRestaurants.map((restaurant, idx) => (
                    <div key={idx} className="food-sheet-card">
                      <div className="food-sheet-card-img">
                        {restaurant.imageUrl ? (
                          <Image
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            width={56}
                            height={56}
                            priority
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : null}
                      </div>
                      <div className="food-sheet-card-info">
                        <div className="food-sheet-card-name">
                          {lang === 'en' ? restaurant.name : restaurant.nameLocal || restaurant.name}
                        </div>
                        {restaurant.description && (
                          <div className="food-sheet-card-desc">{restaurant.description}</div>
                        )}
                        <a
                          href={restaurant.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="food-sheet-card-map"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          Google Map
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ===== MAIN 바텀시트 ===== */
            <>
              {/* 0. 상단: 좌측 구글맵 + 우측 업로드 (사진 없을 때) */}
              {!hasPhotos && (
                <div className="bottom-sheet-header">
                  {dbData && isMainPlace(dbData) && dbData.place && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dbData.place)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bottom-sheet-location-chip"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Map
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </a>
                  )}
                  <MultiPhotoUploadButton
                    remainingSlots={remainingSlots}
                    onUpload={(newPhotos) => {
                      onUpload(newPhotos);
                      if (newPhotos.length > 0) {
                        setTimeout(() => onClose(), 300);
                      }
                    }}
                    userId={userId}
                    uploadPrefix="main"
                    cellId={config?.id}
                  />
                </div>
              )}

              {/* 1. Photo Gallery */}
              {hasPhotos && (
                <div style={{ marginBottom: '16px' }}>
                  <PhotoGallery
                    photos={photos}
                    onDelete={onDeletePhoto}
                    editable={true}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <MultiPhotoUploadButton
                      remainingSlots={remainingSlots}
                      onUpload={(newPhotos) => {
                        onUpload(newPhotos);
                      }}
                      userId={userId}
                      uploadPrefix="main"
                      cellId={config?.id}
                    />
                  </div>
                </div>
              )}

              {/* 2. 참고 이미지 */}
              <div className="bottom-sheet-images">
                {dbData && isMainPlace(dbData) && dbData.image1 && (
                  <div className="bottom-sheet-image-item">
                    <Image
                      src={dbData.image1}
                      alt={lang === 'en' ? dbData.name : dbData.nameKr}
                      fill
                      sizes="140px"
                      priority
                      className="loaded"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                {dbData && isMainPlace(dbData) && dbData.image2 && (
                  <div className="bottom-sheet-image-item">
                    <Image
                      src={dbData.image2}
                      alt={lang === 'en' ? dbData.name : dbData.nameKr}
                      fill
                      sizes="140px"
                      priority
                      className="loaded"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                {dbData && isMainPlace(dbData) && dbData.image3 && (
                  <div className="bottom-sheet-image-item">
                    <Image
                      src={dbData.image3}
                      alt={lang === 'en' ? dbData.name : dbData.nameKr}
                      fill
                      sizes="140px"
                      priority
                      className="loaded"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                {!dbData && config.image && (
                  <div className="bottom-sheet-image-item">
                    <Image
                      src={config.image}
                      alt={cellLabel(config, lang)}
                      fill
                      sizes="140px"
                      priority
                      className="loaded"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              {/* 2. name */}
              <h3 className="bottom-sheet-name">
                {dbData && isMainPlace(dbData)
                  ? (lang === 'en' ? dbData.name : dbData.nameKr)
                  : cellLabel(config, lang)}
              </h3>

              {/* 3. desc */}
              {(() => {
                if (dbData && isMainPlace(dbData)) {
                  const descs = lang === 'en'
                    ? [dbData.desc1En, dbData.desc2En, dbData.desc3En, dbData.desc4En, dbData.desc5En]
                    : [dbData.desc1Kr, dbData.desc2Kr, dbData.desc3Kr, dbData.desc4Kr, dbData.desc5Kr];
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
                if (cellDescription(config, lang)) {
                  return (
                    <div className="bottom-sheet-desc-box">
                      {cellDescription(config, lang)}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Klook 예약 카드 */}
              {dbData && isMainPlace(dbData) && (dbData.klookLink1 || dbData.klookLink2) && (
                <div className="bottom-sheet-klook">
                  <div className="bottom-sheet-klook-header">
                    <span className="klook-badge">Klook</span>
                    <span className="klook-subtitle">{lang === 'en' ? 'Book tickets & activities' : '티켓 & 액티비티 예약'}</span>
                  </div>
                  {dbData.klookLink1 && dbData.klookName1 && (
                    <a
                      href={dbData.klookLink1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bottom-sheet-klook-btn"
                    >
                      <span className="klook-btn-icon">🎟️</span>
                      <span className="klook-btn-label">{lang === 'en' ? dbData.klookName1 : (dbData.klookName1Kr || dbData.klookName1)}</span>
                      <svg className="klook-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  )}
                  {dbData.klookLink2 && dbData.klookName2 && (
                    <a
                      href={dbData.klookLink2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bottom-sheet-klook-btn"
                    >
                      <span className="klook-btn-icon">🎟️</span>
                      <span className="klook-btn-label">{lang === 'en' ? dbData.klookName2 : (dbData.klookName2Kr || dbData.klookName2)}</span>
                      <svg className="klook-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
