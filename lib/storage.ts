import { BingoState, CellState } from './types';
import { CITIES, FOOD_ENTRANCE_IDS, CityConfig } from './constants';

const SKEY_PREFIX = 'travel-bingo-';
export const MAX_CELL_PHOTOS = 3;

// Migration: Convert old photo format to new photos array
function migrateCellState(cell: CellState): CellState {
  // If photos array exists, use it
  if (cell.photos && cell.photos.length > 0) {
    return cell;
  }

  // If only old photo field exists, migrate to array
  if (cell.photo) {
    return {
      ...cell,
      photos: [cell.photo]
    };
  }

  // No photos at all
  return {
    ...cell,
    photos: []
  };
}

export function defaultState(cityId: string = 'kyoto'): BingoState {
  const city = CITIES[cityId];
  if (!city) return { main: {}, food: [] };
  const main: Record<string, CellState> = {};
  for (const id of [...city.placeIds, ...FOOD_ENTRANCE_IDS]) {
    main[id] = { done: false, photo: null, photos: [] };
  }
  return {
    main,
    food: city.foodCells.map(() => ({ done: false, photo: null, photos: [] })),
  };
}

export function loadState(cityId: string = 'kyoto'): BingoState {
  if (typeof window === 'undefined') return defaultState(cityId);
  try {
    const raw = localStorage.getItem(SKEY_PREFIX + cityId);
    if (raw) {
      const parsed = JSON.parse(raw) as BingoState;
      const def = defaultState(cityId);

      // Migrate main cells
      for (const id of Object.keys(def.main)) {
        if (!parsed.main[id]) {
          parsed.main[id] = { done: false, photo: null, photos: [] };
        } else {
          parsed.main[id] = migrateCellState(parsed.main[id]);
        }
      }

      // Migrate food cells
      parsed.food = parsed.food.map(migrateCellState);

      return parsed;
    }
  } catch { /* ignore */ }
  return defaultState(cityId);
}

export function saveState(state: BingoState, cityId: string = 'kyoto'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SKEY_PREFIX + cityId, JSON.stringify(state));
  } catch { /* quota exceeded */ }
}

// === Free Photos ===
const FREE_PHOTOS_PREFIX = 'travel-bingo-free-photos-';
export const MAX_FREE_PHOTOS = 3;

export function loadFreePhotos(cityId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FREE_PHOTOS_PREFIX + cityId);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  return [];
}

export function saveFreePhotos(photos: string[], cityId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FREE_PHOTOS_PREFIX + cityId, JSON.stringify(photos));
  } catch { /* quota exceeded */ }
}
