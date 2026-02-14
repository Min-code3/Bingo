import { logCustomEvent, nowTokyo } from './logger';

/**
 * Analytics helper functions for tracking specific app events
 * These are optional - use them to track important business events
 */

export function trackPhotoUpload(
  userId: string | undefined,
  cellType: 'main' | 'food',
  cellId: string,
  success: boolean
) {
  logCustomEvent(userId, 'photo_upload', {
    target: `${cellType}_${cellId}`,
    metadata: {
      cell_type: cellType,
      cell_id: cellId,
      success,
      timestamp: nowTokyo(),
    },
  });
}

export function trackBingoComplete(
  userId: string | undefined,
  bingoType: 'main' | 'food',
  cityId: string,
  cellsCompleted: number
) {
  logCustomEvent(userId, 'bingo_complete', {
    target: `${bingoType}_${cityId}`,
    metadata: {
      bingo_type: bingoType,
      city_id: cityId,
      cells_completed: cellsCompleted,
      timestamp: nowTokyo(),
    },
  });
}

export function trackCityChange(
  userId: string | undefined,
  fromCity: string,
  toCity: string
) {
  logCustomEvent(userId, 'city_change', {
    target: toCity,
    metadata: {
      from_city: fromCity,
      to_city: toCity,
      timestamp: nowTokyo(),
    },
  });
}

export function trackLanguageChange(
  userId: string | undefined,
  fromLang: string,
  toLang: string
) {
  logCustomEvent(userId, 'language_change', {
    target: toLang,
    metadata: {
      from_lang: fromLang,
      to_lang: toLang,
      timestamp: nowTokyo(),
    },
  });
}

export function trackCellView(
  userId: string | undefined,
  cellType: 'main' | 'food',
  cellId: string
) {
  logCustomEvent(userId, 'cell_view', {
    target: `${cellType}_${cellId}`,
    metadata: {
      cell_type: cellType,
      cell_id: cellId,
      timestamp: nowTokyo(),
    },
  });
}

export function trackRestaurantView(
  userId: string | undefined,
  restaurantName: string,
  cellId: string
) {
  logCustomEvent(userId, 'restaurant_view', {
    target: restaurantName,
    metadata: {
      restaurant_name: restaurantName,
      cell_id: cellId,
      timestamp: nowTokyo(),
    },
  });
}

export function trackExternalLink(
  userId: string | undefined,
  url: string,
  linkType: 'map' | 'other'
) {
  logCustomEvent(userId, 'external_link', {
    target: url,
    metadata: {
      url,
      link_type: linkType,
      timestamp: nowTokyo(),
    },
  });
}

export function trackError(
  userId: string | undefined,
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
) {
  logCustomEvent(userId, 'error', {
    target: errorType,
    metadata: {
      error_type: errorType,
      error_message: errorMessage,
      context,
      timestamp: nowTokyo(),
    },
  });
}
