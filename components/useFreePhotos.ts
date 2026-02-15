'use client';

import { useState, useEffect, useCallback } from 'react';

const SKEY_PREFIX = 'travel-bingo-free-photos-';
const MAX_FREE_PHOTOS = 3;

export function useFreePhotos(cityId: string) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SKEY_PREFIX + cityId);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setPhotos(parsed);
      } else {
        setPhotos([]);
      }
    } catch {
      setPhotos([]);
    }
    setHydrated(true);
  }, [cityId]);

  // Save to localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SKEY_PREFIX + cityId, JSON.stringify(photos));
    } catch { /* quota exceeded */ }
  }, [photos, hydrated, cityId]);

  const addPhoto = useCallback((url: string) => {
    setPhotos(prev => {
      if (prev.length >= MAX_FREE_PHOTOS) return prev;
      return [...prev, url];
    });
  }, []);

  const addPhotos = useCallback((urls: string[]) => {
    setPhotos(prev => {
      const remaining = MAX_FREE_PHOTOS - prev.length;
      if (remaining <= 0) return prev;
      return [...prev, ...urls.slice(0, remaining)];
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const canUpload = photos.length < MAX_FREE_PHOTOS;
  const remainingSlots = MAX_FREE_PHOTOS - photos.length;

  return { photos, addPhoto, addPhotos, removePhoto, canUpload, remainingSlots, hydrated };
}
