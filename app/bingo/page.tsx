'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useBingoState } from '@/components/useBingoState';
import { useI18n } from '@/components/I18nProvider';
import { CITIES, FOOD_ENTRANCE_IDS } from '@/lib/constants';
import { getBingoLineCells, getFoodProgress, isAllMainComplete, getMainProgress, countMainLines } from '@/lib/bingo-logic';
import { generateDummyPhoto } from '@/lib/image-utils';
import { cityLabel } from '@/lib/i18n';
import { logCustomEvent, nowTokyo } from '@/lib/logger';
import { CellConfig } from '@/lib/types';
import { MainPlace, FoodPlace } from '@/lib/sheets';
import BingoCell from '@/components/BingoCell';
import BottomSheet from '@/components/BottomSheet';
import Notification from '@/components/Notification';
import Celebration from '@/components/Celebration';
import Confetti from '@/components/Confetti';

export default function Home() {
  const { state, hydrated, cityId, cellImages, userId, uploadMain, uploadFood, reset, addPhotoMain, removePhotoMain } = useBingoState();
  const { lang, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<CellConfig | null>(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [selectedDbData, setSelectedDbData] = useState<MainPlace | FoodPlace | null>(null);
  const [recentlyUploaded, setRecentlyUploaded] = useState<Set<string>>(new Set());
  const [mainPlaces, setMainPlaces] = useState<MainPlace[]>([]);
  const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);
  const [progressPulse, setProgressPulse] = useState(false);
  const [lineAchieved, setLineAchieved] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const prevPctRef = useRef<number | null>(null); // null = 아직 초기화 안됨
  const prevLinesRef = useRef<number | null>(null); // 빙고 라인 수 추적
  const [videoConsent, setVideoConsent] = useState(false);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const city = CITIES[cityId];
  const mainCells = city?.mainCells ?? [];
  const bingoLineCells = getBingoLineCells(state, cityId);
  const bingoLinesCount = countMainLines(state, cityId);
  const foodProgress = getFoodProgress(state);
  const mainProgress = getMainProgress(state, cityId);
  const pct = mainProgress.total > 0 ? Math.round((mainProgress.done / mainProgress.total) * 100) : 0;

  // 게이지바가 0%에서 움직일 때 특수효과
  useEffect(() => {
    if (!hydrated) return;
    // 첫 hydration 시 현재값 기록만 (애니메이션 안 함)
    if (prevPctRef.current === null) {
      prevPctRef.current = pct;
      return;
    }
    // 실제 0% → >0% 전환 시만 펄스
    if (prevPctRef.current === 0 && pct > 0) {
      setProgressPulse(true);
      setTimeout(() => setProgressPulse(false), 2000);
    }
    prevPctRef.current = pct;
  }, [pct, hydrated]);

  // 빙고 라인 달성 시 그리드 특수효과
  useEffect(() => {
    if (!hydrated) return;
    if (prevLinesRef.current === null) {
      prevLinesRef.current = bingoLinesCount;
      return;
    }
    if (bingoLinesCount > prevLinesRef.current) {
      setLineAchieved(true);
      setTimeout(() => setLineAchieved(false), 1800);

      // 2줄 완성 시 로그
      if (bingoLinesCount >= 2 && prevLinesRef.current < 2) {
        logCustomEvent(userId, 'bingo_2_lines_complete', {
          metadata: {
            city_id: cityId,
            lines_count: bingoLinesCount,
            progress_pct: pct,
            timestamp: nowTokyo()
          }
        });
      }
    }
    prevLinesRef.current = bingoLinesCount;
  }, [bingoLinesCount, hydrated, userId, cityId, pct]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch DB data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mainRes, foodRes] = await Promise.all([
          fetch('/api/main-places'),
          fetch('/api/food-places')
        ]);
        const mainData = await mainRes.json();
        const foodData = await foodRes.json();
        console.log('[Bingo] Fetched mainPlaces:', mainData);
        console.log('[Bingo] Fetched foodPlaces:', foodData);
        setMainPlaces(mainData);
        setFoodPlaces(foodData);

        // 데이터 로드 완료 후 짧은 딜레이로 페이지 완성 후 표시
        setTimeout(() => setPageLoading(false), 400);
      } catch (error) {
        console.error('Failed to fetch places data:', error);
        setTimeout(() => setPageLoading(false), 400);
      }
    };
    fetchData();
  }, []);

  // Check if bingo video is ready
  useEffect(() => {
    if (!userId || !hydrated) return;

    const checkVideo = async () => {
      try {
        const res = await fetch(`/api/video?userId=${userId}&cityId=${cityId}`);
        const data = await res.json();

        if (data.ready && data.videoUrl) {
          setVideoUrl(data.videoUrl);
        }
      } catch (error) {
        console.error('Failed to check video:', error);
      }
    };

    checkVideo();
  }, [userId, cityId, hydrated]);

  // Helper: find DB data for a cell by box number and city
  const findDbData = useCallback((boxIndex: number): MainPlace | FoodPlace | null => {
    const boxNumber = String(boxIndex + 1);

    // First try main places
    const mainPlace = mainPlaces.find(
      p => p.box === boxNumber && p.area.toLowerCase() === cityId.toLowerCase()
    );
    if (mainPlace) return mainPlace;

    // Then try food places by box number
    const foodPlace = foodPlaces.find(
      p => p.box === boxNumber && p.area.toLowerCase() === cityId.toLowerCase()
    );
    return foodPlace || null;
  }, [mainPlaces, foodPlaces, cityId]);

  // 교토의 경우 box 5 (food-1)는 자동 완성하지 않음 - 사용자가 탭해야 함

  const handleUpload = useCallback((id: string, photo: string) => {
    uploadMain(id, photo);

    // 최근 업로드 상태 추가
    setRecentlyUploaded(prev => new Set(prev).add(id));

    // 2초 후 플립
    setTimeout(() => {
      setRecentlyUploaded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);

    const nextState = { ...state, main: { ...state.main, [id]: { done: true, photo } } };
    if (isAllMainComplete(nextState, cityId)) {
      setTimeout(() => setShowCelebration(true), 3000);
    }
  }, [uploadMain, state, cityId]);

  const handleCellClick = useCallback((cfg: CellConfig, idx: number) => {
    // box 5 (가운데 칸 = index 4) 특별 처리 - 교토만
    if (idx === 4 && cityId === 'kyoto') {
      const cellState = state.main[cfg.id];
      if (!cellState?.done) {
        // 0%에서 시작하는지 체크
        const isFirstCompletion = pct === 0;

        // 완성 처리 → 즉시 플립되어 hidden image로 전환
        uploadMain(cfg.id, '');

        // 알림 표시 - 0%에서 시작할 때만 폭죽 추가
        setNotification(isFirstCompletion
          ? `🎉 ${t('tutorial.notification')}`
          : t('tutorial.notification'));
      }
      return;
    }

    // Find DB data for this cell
    const dbData = findDbData(idx);
    setSelectedCell(cfg);
    setSelectedCellIndex(idx);
    setSelectedDbData(dbData);
    setBottomSheetOpen(true);
  }, [cityId, state.main, uploadMain, findDbData]);

  const handleBottomSheetUpload = useCallback((newPhotos: string[]) => {
    if (selectedCell) {
      // Add all new photos to the cell
      newPhotos.forEach(photo => {
        addPhotoMain(selectedCell.id, photo);
      });
    }
  }, [selectedCell, addPhotoMain]);

  const handlePhotoDelete = useCallback((photoIndex: number) => {
    if (selectedCell) {
      removePhotoMain(selectedCell.id, photoIndex);
    }
  }, [selectedCell, removePhotoMain]);

  // 히든 이미지 클릭 시 업로드한 사진을 보여주고 2초 후 다시 플립
  const handleHiddenImageClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cellState = state.main[id];
    if (cellState?.done && cellState.photo) {
      // 업로드한 사진을 보여주기 위해 recentlyUploaded에 추가
      setRecentlyUploaded(prev => new Set(prev).add(id));

      // 2초 후 다시 플립
      setTimeout(() => {
        setRecentlyUploaded(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    }
  }, [state.main]);

  // 비디오 제작 취소
  const handleCancelVideo = useCallback(() => {
    setIsCreatingVideo(false);
    setVideoConsent(false);
    // TODO: 실제 비디오 제작 취소 API 호출
    console.log('Cancelled video creation');
  }, []);

  // 체크박스 클릭 시 자동으로 비디오 제작 시작
  useEffect(() => {
    if (videoConsent && !isCreatingVideo) {
      setIsCreatingVideo(true);
      // TODO: 실제 비디오 제작 API 호출
      console.log('Creating video...');
    }
  }, [videoConsent, isCreatingVideo]);

  if (!hydrated) {
    return (
      <>
        <h2 className="page-title" suppressHydrationWarning>
          {mounted ? t('main.bingo', { city: cityLabel(cityId, lang) }) : `${cityLabel(cityId, 'en')} Bingo`}
        </h2>
        <p className="page-subtitle" suppressHydrationWarning>
          {mounted ? t('main.loading') : 'Loading...'}
        </p>
      </>
    );
  }

  return (
    <>
      {/* 페이지 로딩 오버레이 */}
      {pageLoading && (
        <div className={`page-loading-overlay ${!pageLoading ? 'fade-out' : ''}`}>
          <div className="page-loading-spinner" />
        </div>
      )}

      <h2 className="page-title">{t('main.bingo', { city: cityLabel(cityId, lang) })}</h2>
      <p className="page-subtitle">{t('main.subtitle')}</p>

      {/* 동영상 준비 배너 */}
      {videoUrl && (
        <div style={{
          margin: '12px auto 16px',
          maxWidth: '600px',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>🎉</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                {lang === 'ko' ? '빙고 동영상이 준비되었습니다!' : 'Your Bingo Video is Ready!'}
              </h3>
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                {lang === 'ko' ? '여행의 추억을 동영상으로 만나보세요' : 'Watch your travel memories come to life'}
              </p>
            </div>
          </div>
          <a
            href={videoUrl}
            download
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#667eea',
              borderRadius: '8px',
              textAlign: 'center',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            📥 {lang === 'ko' ? '동영상 다운로드' : 'Download Video'}
          </a>
        </div>
      )}

      <div className={`bingo-grid${pct === 100 ? ' all-complete' : ''}${lineAchieved ? ' bingo-line-achieved' : ''}`}>
        {mainCells.map((cfg, idx) => {
          const cellState = state.main[cfg.id];
          const isLine = bingoLineCells.has(cfg.id);
          const box = String(idx + 1);
          const isFoodEntry = FOOD_ENTRANCE_IDS.includes(cfg.id);
          const isKyotoBox5 = idx === 4 && cityId === 'kyoto'; // 교토 가운데 칸만 특별
          const isRecent = recentlyUploaded.has(cfg.id);
          const shouldFlip = cellState?.done && !isRecent;

          // DB 데이터 확인 - main인지 food인지 판단
          const dbData = findDbData(idx);
          const isFoodCategory = dbData && 'menu' in dbData;
          const cellImage = isFoodCategory ? cellImages?.food[box] : cellImages?.main[box];

          return (
            <div key={cfg.id} className="bingo-cell-wrapper">
              <div
                className={`bingo-cell${cellState?.done ? ' completed' : ''}${isLine ? ' bingo-line' : ''}${isKyotoBox5 ? ' box-5-special' : ''}`}
                data-cell-id={`box-${idx + 1}`}
                onClick={() => handleCellClick(cfg, idx)}
              >
                <div className="flip-card">
                  <div className={`flip-card-inner ${shouldFlip ? 'flipped' : ''}`}>
                    <div className="flip-card-face flip-card-front">
                      {isKyotoBox5 ? (
                        // box 5 교토: 항상 tutorial 텍스트 (플립되면 hidden image)
                        <div className="cell-placeholder box-5-tutorial" style={{ background: cfg.grad }}>
                          <span className="cell-icon">{cellState?.done ? '✨' : '👆'}</span>
                          <span className="cell-label">
                            {t('tutorial.ready')}
                          </span>
                          {!cellState?.done && (
                            <span className="cell-sublabel">
                              {t('tutorial.tap')}
                            </span>
                          )}
                        </div>
                      ) : isRecent && cellState?.photo ? (
                        // 최근 업로드한 사진 표시 (2초 동안)
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cellState.photo} alt="Uploaded" className="cell-photo" />
                      ) : cellImage ? (
                        <div className="cell-image-with-name">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cellImage.imageUrl} alt={cfg.label} className="cell-photo" />
                          <div className="cell-name-overlay">
                            {lang === 'en' ? cellImage.name : (cellImage.nameKr || cellImage.name)}
                          </div>
                        </div>
                      ) : (
                        <div className="cell-placeholder" style={{ background: cfg.grad }}>
                          <span className="cell-icon">{cfg.icon}</span>
                          <span className="cell-label">{cfg.label}</span>
                          {cfg.sub && <span className="cell-sublabel">{cfg.sub}</span>}
                          {isFoodEntry && !isKyotoBox5 && (
                            <span className="cell-sublabel">{foodProgress.done}/{foodProgress.total}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className="flip-card-face flip-card-back"
                      onClick={(e) => handleHiddenImageClick(cfg.id, e)}
                    >
                      {cellState?.done ? (
                        cellImages?.hidden[box] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cellImages.hidden[box]} alt={t('cell.hiddenPicture')} className="cell-photo" />
                        ) : (
                          <div className="cell-placeholder" style={{ background: cfg.grad }}>
                            <span className="cell-icon">✅</span>
                            <span className="cell-label">{t('cell.hiddenPicture')}</span>
                          </div>
                        )
                      ) : (
                        <div className="cell-placeholder" style={{ background: cfg.grad }}>
                          <span className="cell-icon">{cfg.icon}</span>
                          <span className="cell-label">{cfg.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`bottom-progress${progressPulse ? ' progress-pulse' : ''}`}>
        <div className="bottom-progress-bar">
          <div className="bottom-progress-fill" style={{ width: `${pct}%` }} />
          <div className="bottom-progress-text">{pct}%</div>
        </div>
      </div>

      {/* 빙고 라인 카운터 → 줄 수에 따라 다른 메시지 */}
      <div className={`bingo-lines-counter${bingoLinesCount >= 2 ? ' lines-complete' : ''}`}>
        <span className="bingo-lines-label">
          {bingoLinesCount === 0
            ? (lang === 'en' ? '✨ Your highlight video is waiting...' : '✨ 하이라이트 영상이 기다리고 있어요...')
            : bingoLinesCount === 1
            ? (lang === 'en' ? '🎬 Almost there! One more line!' : '🎬 거의 다 왔어요! 1줄만 더!')
            : isCreatingVideo
            ? (lang === 'en' ? '🎬 Creating your video...' : '🎬 비디오 제작중...')
            : (lang === 'en' ? '🎉 Video creation available' : '🎉 비디오 제작 가능')}
        </span>
        <span className="bingo-lines-count">{bingoLinesCount < 2 ? `${bingoLinesCount}/2` : ''}</span>
      </div>

      {/* 비디오 제작 섹션 - 2줄 완성 시 표시 */}
      {bingoLinesCount >= 2 && (
        <>
          {isCreatingVideo ? (
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
              <span
                className="video-cancel-btn"
                onClick={handleCancelVideo}
                style={{ cursor: 'pointer' }}
              >
                {lang === 'en' ? 'Cancel Creation' : '제작 취소'}
              </span>
            </div>
          ) : (
            <div className="video-creation-section">
              <label className="video-consent-checkbox">
                <input
                  type="checkbox"
                  checked={videoConsent}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setVideoConsent(isChecked);

                    if (isChecked) {
                      logCustomEvent(userId, 'video_consent_agreed', {
                        metadata: {
                          city_id: cityId,
                          bingo_lines: bingoLinesCount,
                          progress_pct: pct,
                          timestamp: nowTokyo()
                        }
                      });
                    }
                  }}
                />
                <span>
                  {lang === 'en'
                    ? 'I agree to use my photos for video creation'
                    : '사진을 영상 제작에 사용하는 것에 동의합니다'}
                </span>
              </label>
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className="small-reset-btn"
          onClick={() => { if (confirm(t('main.confirmReset'))) reset(); }}
        >
          {t('main.reset')}
        </button>
      </div>

      <Confetti show={progressPulse || lineAchieved} />
      <Notification message={notification} onDone={() => setNotification(null)} />
      <Celebration show={showCelebration} onClose={() => setShowCelebration(false)} />
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        config={selectedCell}
        dbData={selectedDbData}
        category={
          selectedDbData && 'id' in selectedDbData
            ? 'main'  // MainPlace has 'id' field
            : 'food'  // FoodPlace has 'menu' field
        }
        photos={selectedCell ? (state.main[selectedCell.id]?.photos || []) : []}
        onUpload={handleBottomSheetUpload}
        onDeletePhoto={handlePhotoDelete}
        userId={userId}
        boxNumber={selectedCellIndex !== null ? selectedCellIndex + 1 : undefined}
        foodRestaurants={
          selectedDbData && 'menu' in selectedDbData
            ? foodPlaces
                .filter(fp => fp.box === (selectedDbData as FoodPlace).box && fp.area === (selectedDbData as FoodPlace).area)
                .map(fp => ({
                  name: fp.nameEn,
                  nameLocal: fp.nameKr,
                  description: lang === 'en' ? fp.descEn : fp.descKr,
                  mapQuery: fp.nameEn,
                  imageUrl: fp.imageUrl,
                }))
            : []
        }
      />
    </>
  );
}
