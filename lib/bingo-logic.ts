import { BingoState } from './types';
import { FOOD_LINES, FOOD_ENTRANCE_IDS, CITIES, MAIN_LINES, PLACE_CELL_IDS } from './constants';

export function countFoodLines(state: BingoState): number {
  return FOOD_LINES.filter(line => line.every(i => state.food[i]?.done)).length;
}

export function isFoodBingoComplete(state: BingoState): boolean {
  return countFoodLines(state) >= 2;
}

export function getCompletedMainLines(state: BingoState, cityId: string = 'osaka'): string[][] {
  const lines = CITIES[cityId]?.mainLines ?? MAIN_LINES;
  return lines.filter(line => line.every(id => state.main[id]?.done));
}

export function countMainLines(state: BingoState, cityId?: string): number {
  return getCompletedMainLines(state, cityId).length;
}

export function getBingoLineCells(state: BingoState, cityId?: string): Set<string> {
  const cells = new Set<string>();
  for (const line of getCompletedMainLines(state, cityId)) {
    for (const id of line) cells.add(id);
  }
  return cells;
}

export function getMainProgress(state: BingoState, cityId: string = 'osaka'): { done: number; total: number } {
  const city = CITIES[cityId];
  const placeIds = city?.placeIds ?? PLACE_CELL_IDS;
  const allIds = [...placeIds, ...FOOD_ENTRANCE_IDS];
  const done = allIds.filter(id => state.main[id]?.done).length;
  return { done, total: allIds.length };
}

export function getPictureProgress(state: BingoState, cityId?: string): { done: number; total: number } {
  const p = getMainProgress(state, cityId);
  return { done: p.done, total: 9 };
}

export function getFoodProgress(state: BingoState): { done: number; total: number } {
  const done = state.food.filter(f => f.done).length;
  return { done, total: state.food.length };
}

export function isAllMainComplete(state: BingoState, cityId: string = 'osaka'): boolean {
  const p = getMainProgress(state, cityId);
  return p.done >= p.total;
}
