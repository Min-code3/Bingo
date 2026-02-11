'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CellConfig } from '@/lib/types';
import { useI18n } from './I18nProvider';
import { cellLabel } from '@/lib/i18n';
import HiddenPiece from './HiddenPiece';

interface FoodEntranceCellProps {
  config: CellConfig;
  done: boolean;
  isBingoLine: boolean;
  foodProgress: { done: number; total: number };
  sheetImage?: string;
  hiddenImage?: string;
}

export default function FoodEntranceCell({ config, done, isBingoLine, foodProgress, sheetImage, hiddenImage }: FoodEntranceCellProps) {
  const router = useRouter();
  const { lang, t } = useI18n();

  const cellClasses = [
    'bingo-cell food-entrance',
    done ? 'completed' : '',
    isBingoLine ? 'bingo-line' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cellClasses} onClick={() => router.push('/food')}>
      <div className="flip-card">
        <div className={`flip-card-inner ${done ? 'flipped' : ''}`}>
          <div className="flip-card-face flip-card-front">
            {sheetImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sheetImage} alt={cellLabel(config, lang)} className="cell-photo" />
                <div className="cell-overlay-label">{foodProgress.done}/{foodProgress.total}</div>
              </>
            ) : (
              <div className="cell-placeholder food-entrance-bg">
                <span className="cell-icon">{config.icon}</span>
                <span className="cell-label">{t('food.entrance.label')}</span>
                <span className="cell-sublabel">{foodProgress.done}/{foodProgress.total}</span>
              </div>
            )}
          </div>
          <div className="flip-card-face flip-card-back">
            {done ? (
              <>
                {hiddenImage
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={hiddenImage} alt={t('cell.hiddenPicture')} className="cell-photo" />
                  : <HiddenPiece pp={config.pp} ps={config.ps} />
                }
              </>
            ) : (
              <div className="cell-placeholder food-entrance-bg">
                <span className="cell-icon">🎉</span>
                <span className="cell-label">{t('food.entrance.complete')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
