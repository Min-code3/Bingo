'use client';

import { useContext, useCallback } from 'react';
import { BingoContext } from './BingoProvider';

export function useBingoState() {
  const { state, dispatch, hydrated, cityId, setCityId, cellImages, userId } = useContext(BingoContext);

  const uploadMain = useCallback((id: string, photo: string) => {
    dispatch({ type: 'UPLOAD_MAIN', id, photo });
  }, [dispatch]);

  const uploadFood = useCallback((index: number, photo: string) => {
    dispatch({ type: 'UPLOAD_FOOD', index, photo });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', cityId });
  }, [dispatch, cityId]);

  return { state, hydrated, cityId, setCityId, cellImages, userId, uploadMain, uploadFood, reset };
}
