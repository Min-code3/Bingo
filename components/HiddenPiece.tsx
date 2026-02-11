'use client';

import React, { useMemo } from 'react';
import { HIDDEN_SVG } from '@/lib/constants';

interface HiddenPieceProps {
  pp: string; // background-position
  ps: string; // background-size
}

export default function HiddenPiece({ pp, ps }: HiddenPieceProps) {
  const url = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const blob = new Blob([HIDDEN_SVG], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }, []);

  if (!url) return <div className="w-full h-full bg-stone-800" />;

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundImage: `url('${url}')`,
        backgroundSize: ps,
        backgroundPosition: pp,
        backgroundColor: '#2d2d2d',
      }}
    />
  );
}
