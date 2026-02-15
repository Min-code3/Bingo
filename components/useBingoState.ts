'use client';

import { useContext, useCallback } from 'react';
import { BingoContext } from './BingoProvider';
import { deleteImageFromSupabase } from '@/lib/upload-utils';

export function useBingoState() {
  const { state, dispatch, hydrated, cityId, setCityId, cellImages, userId, freePhotos, addFreePhotos, canFreeUpload, freeRemainingSlots } = useContext(BingoContext);

  const uploadMain = useCallback((id: string, photo: string) => {
    dispatch({ type: 'UPLOAD_MAIN', id, photo });
  }, [dispatch]);

  const uploadFood = useCallback((index: number, photo: string) => {
    dispatch({ type: 'UPLOAD_FOOD', index, photo });
  }, [dispatch]);

  // NEW: Add photo to main cell
  const addPhotoMain = useCallback((id: string, photo: string) => {
    dispatch({ type: 'ADD_PHOTO_MAIN', id, photo });
  }, [dispatch]);

  // NEW: Remove photo from main cell (with Supabase cleanup)
  const removePhotoMain = useCallback((id: string, photoIndex: number) => {
    const cellState = state.main[id];
    const photos = cellState?.photos || [];
    const photoUrl = photos[photoIndex];

    // Optimistic update: remove from state immediately
    dispatch({ type: 'REMOVE_PHOTO_MAIN', id, photoIndex });

    // Background cleanup: delete from Supabase (fire and forget)
    if (photoUrl && photoUrl.includes('supabase')) {
      deleteImageFromSupabase(photoUrl).catch(err => {
        console.error('Failed to delete from Supabase (orphaned file):', err);
      });
    }
  }, [dispatch, state.main]);

  // NEW: Add photo to food cell
  const addPhotoFood = useCallback((index: number, photo: string) => {
    dispatch({ type: 'ADD_PHOTO_FOOD', index, photo });
  }, [dispatch]);

  // NEW: Remove photo from food cell (with Supabase cleanup)
  const removePhotoFood = useCallback((index: number, photoIndex: number) => {
    const cellState = state.food[index];
    const photos = cellState?.photos || [];
    const photoUrl = photos[photoIndex];

    // Optimistic update
    dispatch({ type: 'REMOVE_PHOTO_FOOD', index, photoIndex });

    // Background cleanup
    if (photoUrl && photoUrl.includes('supabase')) {
      deleteImageFromSupabase(photoUrl).catch(err => {
        console.error('Failed to delete from Supabase (orphaned file):', err);
      });
    }
  }, [dispatch, state.food]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', cityId });
  }, [dispatch, cityId]);

  return {
    state,
    hydrated,
    cityId,
    setCityId,
    cellImages,
    userId,
    uploadMain,
    uploadFood,
    reset,
    freePhotos,
    addFreePhotos,
    canFreeUpload,
    freeRemainingSlots,
    // NEW exports
    addPhotoMain,
    removePhotoMain,
    addPhotoFood,
    removePhotoFood
  };
}
