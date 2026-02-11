const SHEET_ID = '1vUwyoT9mgYBFZr5EkRWNk7PEXXpZKTORQzcwgBtFJY4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export interface CellImages {
  main: Record<string, string>;
  hidden: Record<string, string>;
  hiddenFull: string;
  food: Record<string, string>;
}

export type AllCellImages = Record<string, CellImages>; // area → images

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  for (const line of csv.split('\n')) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(current); current = ''; continue; }
      current += ch;
    }
    cols.push(current);
    rows.push(cols);
  }
  return rows;
}

export interface FoodPlace {
  area: string;
  menu: string;
  nameEn: string;
  nameKr: string;
  priority: number;
  descEn: string;
  descKr: string;
  floorEn: string;
  floorKr: string;
  closedEn: string;
  closedKr: string;
  url: string;
}

export async function fetchFoodPlaces(): Promise<FoodPlace[]> {
  const res = await fetch(`${CSV_URL}&sheet=food`, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[sheets] food fetch failed:', res.status);
    return [];
  }
  const rows = parseCSV(await res.text());
  const places: FoodPlace[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]?.trim()) continue;
    places.push({
      area: (r[1] ?? '').trim().toLowerCase(),
      menu: (r[2] ?? '').trim(),
      nameEn: (r[3] ?? '').trim(),
      nameKr: (r[4] ?? '').trim(),
      priority: parseInt(r[5] ?? '99', 10) || 99,
      descEn: (r[7] ?? '').trim(),
      descKr: (r[8] ?? '').trim(),
      floorEn: (r[9] ?? '').trim(),
      floorKr: (r[10] ?? '').trim(),
      closedEn: (r[11] ?? '').trim(),
      closedKr: (r[12] ?? '').trim(),
      url: (r[14] ?? '').trim(),
    });
  }
  return places;
}

export async function fetchAllCellImages(): Promise<AllCellImages> {
  const res = await fetch(CSV_URL, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[sheets] fetch failed:', res.status);
    return {};
  }
  const rows = parseCSV(await res.text());
  const result: AllCellImages = {};

  for (let i = 1; i < rows.length; i++) {
    const [, area, category, box, , imageUrl] = rows[i];
    if (!area || !category || !imageUrl?.trim()) continue;

    const areaKey = area.toLowerCase();
    if (!result[areaKey]) result[areaKey] = { main: {}, hidden: {}, hiddenFull: '', food: {} };
    const entry = result[areaKey];
    const url = imageUrl.trim();

    if (category === 'main') entry.main[box] = url;
    else if (category === 'main_hidden') {
      if (box === '0') entry.hiddenFull = url;
      else entry.hidden[box] = url;
    }
    else if (category === 'food') entry.food[box] = url;
  }
  return result;
}
