'use client';

import React, { createContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { BingoState, BingoAction } from '@/lib/types';
import { defaultState, loadState, saveState, loadFreePhotos, saveFreePhotos, MAX_FREE_PHOTOS, MAX_CELL_PHOTOS } from '@/lib/storage';
import { isFoodBingoComplete } from '@/lib/bingo-logic';
import { FOOD_ENTRANCE_IDS, CITIES } from '@/lib/constants';
import { AllCellImages, CellImages } from '@/lib/sheets';
import { useAnonymousUser } from './useAnonymousUser';

function bingoReducer(state: BingoState, action: BingoAction): BingoState {
  switch (action.type) {
    case 'UPLOAD_MAIN': {
      // Legacy: single photo upload (backward compatible)
      const currentCell = state.main[action.id];
      const photos = currentCell?.photos || [];
      return {
        ...state,
        main: {
          ...state.main,
          [action.id]: {
            done: true,
            photo: action.photo,  // Keep for backward compatibility
            photos: photos.length > 0 ? photos : [action.photo]  // Migrate to array
          }
        }
      };
    }

    case 'ADD_PHOTO_MAIN': {
      const currentCell = state.main[action.id] || { done: false, photo: null, photos: [] };
      const currentPhotos = currentCell.photos || (currentCell.photo ? [currentCell.photo] : []);

      // Don't exceed MAX_CELL_PHOTOS
      if (currentPhotos.length >= MAX_CELL_PHOTOS) return state;

      const newPhotos = [...currentPhotos, action.photo];
      return {
        ...state,
        main: {
          ...state.main,
          [action.id]: {
            done: newPhotos.length > 0,
            photo: newPhotos[0] || null,  // Keep first photo as primary
            photos: newPhotos
          }
        }
      };
    }

    case 'REMOVE_PHOTO_MAIN': {
      const currentCell = state.main[action.id];
      if (!currentCell?.photos) return state;

      const newPhotos = currentCell.photos.filter((_, idx) => idx !== action.photoIndex);
      return {
        ...state,
        main: {
          ...state.main,
          [action.id]: {
            done: newPhotos.length > 0,
            photo: newPhotos[0] || null,
            photos: newPhotos
          }
        }
      };
    }

    case 'UPLOAD_FOOD': {
      // Legacy: single photo upload
      const currentCell = state.food[action.index];
      const photos = currentCell?.photos || [];
      const food = [...state.food];
      food[action.index] = {
        done: true,
        photo: action.photo,
        photos: photos.length > 0 ? photos : [action.photo]
      };
      let next: BingoState = { ...state, food };
      if (isFoodBingoComplete(next)) {
        const main = { ...next.main };
        for (const id of FOOD_ENTRANCE_IDS) main[id] = { ...main[id], done: true };
        next = { ...next, main };
      }
      return next;
    }

    case 'ADD_PHOTO_FOOD': {
      const currentCell = state.food[action.index] || { done: false, photo: null, photos: [] };
      const currentPhotos = currentCell.photos || (currentCell.photo ? [currentCell.photo] : []);

      if (currentPhotos.length >= MAX_CELL_PHOTOS) return state;

      const newPhotos = [...currentPhotos, action.photo];
      const food = [...state.food];
      food[action.index] = {
        done: newPhotos.length > 0,
        photo: newPhotos[0] || null,
        photos: newPhotos
      };
      let next: BingoState = { ...state, food };
      if (isFoodBingoComplete(next)) {
        const main = { ...next.main };
        for (const id of FOOD_ENTRANCE_IDS) main[id] = { ...main[id], done: true };
        next = { ...next, main };
      }
      return next;
    }

    case 'REMOVE_PHOTO_FOOD': {
      const currentCell = state.food[action.index];
      if (!currentCell?.photos) return state;

      const newPhotos = currentCell.photos.filter((_, idx) => idx !== action.photoIndex);
      const food = [...state.food];
      food[action.index] = {
        done: newPhotos.length > 0,
        photo: newPhotos[0] || null,
        photos: newPhotos
      };
      return { ...state, food };
    }

    case 'RESET': return defaultState(action.cityId || 'kyoto');
    case 'LOAD': return action.state;
    default: return state;
  }
}

interface BingoContextValue {
  state: BingoState;
  dispatch: React.Dispatch<BingoAction>;
  hydrated: boolean;
  cityId: string;
  setCityId: (id: string) => void;
  cellImages: CellImages | null;
  userId: string | undefined;
  freePhotos: string[];
  addFreePhotos: (urls: string[]) => void;
  canFreeUpload: boolean;
  freeRemainingSlots: number;
}

export const BingoContext = createContext<BingoContextValue>({
  state: defaultState(),
  dispatch: () => {},
  hydrated: false,
  cityId: 'kyoto',
  setCityId: () => {},
  cellImages: null,
  userId: undefined,
  freePhotos: [],
  addFreePhotos: () => {},
  canFreeUpload: true,
  freeRemainingSlots: MAX_FREE_PHOTOS,
});

export function BingoProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAnonymousUser();
  const [cityId, setCityIdRaw] = React.useState('kyoto');
  const [state, dispatch] = useReducer(bingoReducer, defaultState());
  const [hydrated, setHydrated] = React.useState(false);
  const [allImages, setAllImages] = React.useState<AllCellImages | null>(null);
  const [freePhotos, setFreePhotos] = React.useState<string[]>([]);
  const isInitial = useRef(true);

  // Load state for current city
  useEffect(() => {
    const saved = loadState(cityId);
    dispatch({ type: 'LOAD', state: saved });
    setFreePhotos(loadFreePhotos(cityId));
    setHydrated(true);
  }, [cityId]);

  // Save on state change
  useEffect(() => {
    if (isInitial.current) { isInitial.current = false; return; }
    if (hydrated) saveState(state, cityId);
  }, [state, hydrated, cityId]);

  // Fetch all images on mount (refresh on every page load)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/cells');
        const data = await res.json();
        setAllImages(data);
      } catch (error) {
        console.error('[BingoProvider] Failed to fetch cell images:', error);
        setAllImages({});
      }
    };
    fetchImages();
  }, []);

  const setCityId = (id: string) => {
    if (CITIES[id]) {
      isInitial.current = true;
      setCityIdRaw(id);
    }
  };

  const cellImages = allImages?.[cityId] ?? null;

  // Free photos
  const addFreePhotos = useCallback((urls: string[]) => {
    setFreePhotos(prev => {
      const remaining = MAX_FREE_PHOTOS - prev.length;
      if (remaining <= 0) return prev;
      const next = [...prev, ...urls.slice(0, remaining)];
      saveFreePhotos(next, cityId);
      return next;
    });
  }, [cityId]);

  const canFreeUpload = freePhotos.length < MAX_FREE_PHOTOS;
  const freeRemainingSlots = MAX_FREE_PHOTOS - freePhotos.length;

  return (
    <BingoContext.Provider value={{ state, dispatch, hydrated, cityId, setCityId, cellImages, userId, freePhotos, addFreePhotos, canFreeUpload, freeRemainingSlots }}>
      {children}
    </BingoContext.Provider>
  );
}
