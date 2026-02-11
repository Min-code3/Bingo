'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CellConfig } from '@/lib/types';
import { useI18n } from './I18nProvider';
import { cellLabel, cellSub } from '@/lib/i18n';
import HiddenPiece from './HiddenPiece';
import UploadButton from './UploadButton';

interface BingoCellProps {
  config: CellConfig;
  done: boolean;
  photo: string | null;
  isBingoLine: boolean;
  onUpload: (photo: string) => void;
  placeUrl: string;
  sheetImage?: string;
  hiddenImage?: string;
  keepPhoto?: boolean;
  userId?: string;
}

export default function BingoCell({ config, done, photo, isBingoLine, onUpload, placeUrl, sheetImage, hiddenImage, keepPhoto, userId }: BingoCellProps) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [flipped, setFlipped] = useState(keepPhoto && done && !!photo);
  const [justUploaded, setJustUploaded] = useState(false);

  useEffect(() => {
    if (justUploaded && done && photo) {
      setFlipped(true);
      if (keepPhoto) {
        const t = setTimeout(() => setJustUploaded(false), 1500);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setFlipped(false);
          setJustUploaded(false);
        }, 1500);
        return () => clearTimeout(t);
      }
    }
  }, [justUploaded, done, photo, keepPhoto]);

  const handleUpload = useCallback((p: string) => {
    setJustUploaded(true);
    onUpload(p);
  }, [onUpload]);

  const handleCellClick = () => {
    if (done && photo) {
      if (keepPhoto) return;
      setFlipped(prev => !prev);
    } else {
      router.push(placeUrl);
    }
  };

  const cellClasses = [
    'bingo-cell',
    done ? 'completed' : '',
    isBingoLine ? 'bingo-line' : '',
  ].filter(Boolean).join(' ');

  const renderDefaultFace = () => {
    if (sheetImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sheetImage} alt={cellLabel(config, lang)} className="cell-photo" />
      );
    }
    return (
      <div className="cell-placeholder" style={{ background: config.grad }}>
        <span className="cell-icon">{config.icon}</span>
        <span className="cell-label">{cellLabel(config, lang)}</span>
        {cellSub(config, lang) && <span className="cell-sublabel">{cellSub(config, lang)}</span>}
      </div>
    );
  };

  const renderHiddenFace = () => {
    if (hiddenImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hiddenImage} alt={t('cell.hiddenPicture')} className="cell-photo" />
      );
    }
    return <HiddenPiece pp={config.pp} ps={config.ps} />;
  };

  const isFoodEntry = config.id.startsWith('food-');

  return (
    <div className={cellClasses} data-cell-id={config.id}>
      <div className="flip-card" onClick={handleCellClick} data-cell-id={config.id}>
        <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flip-card-face flip-card-front">
            {done ? renderHiddenFace() : renderDefaultFace()}
          </div>
          <div className="flip-card-face flip-card-back">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={cellLabel(config, lang)} className="cell-photo" />
            ) : renderDefaultFace()}
          </div>
        </div>
        {!isFoodEntry && (!done || (done && flipped)) && (
          <div className="cell-upload-overlay">
            <UploadButton hasPhoto={!!photo} onUpload={handleUpload} userId={userId} uploadPrefix="main" />
          </div>
        )}
      </div>
    </div>
  );
}
