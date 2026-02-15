'use client';

import React, { useState } from 'react';

interface PhotoGalleryProps {
  photos: string[];
  onDelete?: (index: number) => void;
  editable?: boolean;
}

export default function PhotoGallery({ photos, onDelete, editable = false }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) return null;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(currentIndex);
      if (currentIndex >= photos.length - 1) {
        setCurrentIndex(Math.max(0, photos.length - 2));
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[currentIndex]}
        alt={`Photo ${currentIndex + 1}`}
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
      />

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              zIndex: 10
            }}
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              zIndex: 10
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Delete Button */}
      {editable && onDelete && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(220, 38, 38, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          🗑️ 삭제
        </button>
      )}

      {/* Counter */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600
        }}
      >
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}
