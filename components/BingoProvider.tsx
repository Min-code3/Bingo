'use client';

import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { BingoState, BingoAction } from '@/lib/types';
import { defaultState, loadState, saveState } from '@/lib/storage';
import { isFoodBingoComplete } from '@/lib/bingo-logic';
import { FOOD_ENTRANCE_IDS, CITIES } from '@/lib/constants';
import { AllCellImages, CellImages } from '@/lib/sheets';
import { useAnonymousUser } from './useAnonymousUser';

function bingoReducer(state: BingoState, action: BingoAction): BingoState {
  switch (action.type) {
    case 'UPLOAD_MAIN': {
      return { ...state, main: { ...state.main, [action.id]: { done: true, photo: action.photo } } };
    }
    case 'UPLOAD_FOOD': {
      const food = [...state.food];
      food[action.index] = { done: true, photo: action.photo };
      let next: BingoState = { ...state, food };
      if (isFoodBingoComplete(next)) {
        const main = { ...next.main };
        for (const id of FOOD_ENTRANCE_IDS) main[id] = { ...main[id], done: true };
        next = { ...next, main };
      }
      return next;
    }
    case 'RESET': return defaultState(action.cityId || 'osaka');
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
}

export const BingoContext = createContext<BingoContextValue>({
  state: defaultState(),
  dispatch: () => {},
  hydrated: false,
  cityId: 'osaka',
  setCityId: () => {},
  cellImages: null,
  userId: undefined,
});

export function BingoProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAnonymousUser();
  const [cityId, setCityIdRaw] = React.useState('osaka');
  const [state, dispatch] = useReducer(bingoReducer, defaultState());
  const [hydrated, setHydrated] = React.useState(false);
  const [allImages, setAllImages] = React.useState<AllCellImages | null>(null);
  const isInitial = useRef(true);

  // Load state for current city
  useEffect(() => {
    const saved = loadState(cityId);
    dispatch({ type: 'LOAD', state: saved });
    setHydrated(true);
  }, [cityId]);

  // Save on state change
  useEffect(() => {
    if (isInitial.current) { isInitial.current = false; return; }
    if (hydrated) saveState(state, cityId);
  }, [state, hydrated, cityId]);

  // Fetch all images once
  useEffect(() => {
    fetch('/api/cells').then(r => r.json()).then(setAllImages).catch(() => setAllImages({}));
  }, []);

  const setCityId = (id: string) => {
    if (CITIES[id]) {
      isInitial.current = true;
      setCityIdRaw(id);
    }
  };

  const cellImages = allImages?.[cityId] ?? null;

  return (
    <BingoContext.Provider value={{ state, dispatch, hydrated, cityId, setCityId, cellImages, userId }}>
      {children}
    </BingoContext.Provider>
  );
}
