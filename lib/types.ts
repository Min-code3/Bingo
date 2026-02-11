export interface CellConfig {
  id: string;
  label: string;
  sub: string;
  icon: string;
  grad: string;
  // hidden picture position
  pp: string;
  ps: string;
  // cell image (user-provided static file)
  image?: string; // e.g. '/images/cells/wild.png'
  // place detail info
  description?: string;
  mapQuery?: string;   // Google Maps embed query
  klookUrl?: string;   // Klook booking link
}

export interface CellState {
  done: boolean;
  photo: string | null;
}

export interface BingoState {
  main: Record<string, CellState>;
  food: CellState[];
}

export type BingoAction =
  | { type: 'UPLOAD_MAIN'; id: string; photo: string }
  | { type: 'UPLOAD_FOOD'; index: number; photo: string }
  | { type: 'COMPLETE_FOOD_MEGA' }
  | { type: 'RESET'; cityId?: string }
  | { type: 'LOAD'; state: BingoState };
