const SHEET_ID = '1vUwyoT9mgYBFZr5EkRWNk7PEXXpZKTORQzcwgBtFJY4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export interface CellData {
  imageUrl: string;
  name: string;
  nameKr: string;
}

export interface CellImages {
  main: Record<string, CellData>;
  hidden: Record<string, string>;
  hiddenFull: string;
  food: Record<string, CellData>;
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
  box: string;
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
  imageUrl: string;
  url: string;
}

export interface MainPlace {
  id: string;
  area: string;
  box: string;
  name: string;
  nameKr: string;
  image1: string;
  image2: string;
  desc1En: string;
  desc1Kr: string;
  desc2En: string;
  desc2Kr: string;
  desc3En: string;
  desc3Kr: string;
  desc4En: string;
  desc4Kr: string;
}

export async function fetchFoodPlaces(): Promise<FoodPlace[]> {
  const res = await fetch(`${CSV_URL}&gid=1570588835`, { cache: 'no-store' });
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
      box: (r[3] ?? '').trim(),
      nameEn: (r[4] ?? '').trim(),
      nameKr: (r[5] ?? '').trim(),
      priority: parseInt(r[6] ?? '99', 10) || 99,
      descEn: (r[8] ?? '').trim(),
      descKr: (r[9] ?? '').trim(),
      floorEn: (r[10] ?? '').trim(),
      floorKr: (r[11] ?? '').trim(),
      closedEn: (r[12] ?? '').trim(),
      closedKr: (r[13] ?? '').trim(),
      imageUrl: (r[14] ?? '').trim(),
      url: (r[15] ?? '').trim(),
    });
  }
  return places;
}

export async function fetchMainPlaces(): Promise<MainPlace[]> {
  const res = await fetch(`${CSV_URL}&gid=457233886`, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[sheets] main fetch failed:', res.status);
    return [];
  }
  const rows = parseCSV(await res.text());
  const places: MainPlace[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]?.trim()) continue;
    places.push({
      id: (r[0] ?? '').trim(),
      area: (r[1] ?? '').trim().toLowerCase(),
      box: (r[2] ?? '').trim(),
      name: (r[3] ?? '').trim(),
      nameKr: (r[4] ?? '').trim(),
      image1: (r[5] ?? '').trim(),
      image2: (r[6] ?? '').trim(),
      desc1En: (r[7] ?? '').trim(),
      desc1Kr: (r[8] ?? '').trim(),
      desc2En: (r[9] ?? '').trim(),
      desc2Kr: (r[10] ?? '').trim(),
      desc3En: (r[11] ?? '').trim(),
      desc3Kr: (r[12] ?? '').trim(),
      desc4En: (r[13] ?? '').trim(),
      desc4Kr: (r[14] ?? '').trim(),
    });
  }
  return places;
}

export async function fetchAllCellImages(): Promise<AllCellImages> {
  const res = await fetch(`${CSV_URL}&gid=687563270`, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[sheets] fetch failed:', res.status);
    return {};
  }
  const rows = parseCSV(await res.text());
  const result: AllCellImages = {};

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const id = r[0]?.trim();
    const area = r[1]?.trim();
    const category = r[2]?.trim();
    const box = r[3]?.trim();
    const name = r[4]?.trim();
    const nameKr = r[5]?.trim();
    const imageUrl = r[6]?.trim();

    if (!area || !category) continue;

    const areaKey = area.toLowerCase();
    if (!result[areaKey]) {
      result[areaKey] = {
        main: {},
        hidden: {},
        hiddenFull: '',
        food: {},
      };
    }
    const entry = result[areaKey];

    if (category === 'main' && imageUrl) {
      entry.main[box] = { imageUrl, name, nameKr };
    } else if (category === 'main_hidden' && imageUrl) {
      if (box === '0') {
        entry.hiddenFull = imageUrl;
      } else {
        entry.hidden[box] = imageUrl;
      }
    } else if (category === 'food' && imageUrl) {
      entry.food[box] = { imageUrl, name, nameKr };
    }
  }
  return result;
}
