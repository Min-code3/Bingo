import { BingoState, CellState } from './types';
import { CITIES, FOOD_ENTRANCE_IDS, CityConfig } from './constants';

const SKEY_PREFIX = 'travel-bingo-';

export function defaultState(cityId: string = 'osaka'): BingoState {
  const city = CITIES[cityId];
  if (!city) return { main: {}, food: [] };
  const main: Record<string, CellState> = {};
  for (const id of [...city.placeIds, ...FOOD_ENTRANCE_IDS]) {
    main[id] = { done: false, photo: null };
  }
  return {
    main,
    food: city.foodCells.map(() => ({ done: false, photo: null })),
  };
}

export function loadState(cityId: string = 'osaka'): BingoState {
  if (typeof window === 'undefined') return defaultState(cityId);
  try {
    const raw = localStorage.getItem(SKEY_PREFIX + cityId);
    if (raw) {
      const parsed = JSON.parse(raw) as BingoState;
      const def = defaultState(cityId);
      for (const id of Object.keys(def.main)) {
        if (!parsed.main[id]) parsed.main[id] = { done: false, photo: null };
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return defaultState(cityId);
}

export function saveState(state: BingoState, cityId: string = 'osaka'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SKEY_PREFIX + cityId, JSON.stringify(state));
  } catch { /* quota exceeded */ }
}
