export type Lang = 'en' | 'ko';

// ── Cell ID → menu name mapping (for food place filtering) ──────
export const CELL_TO_MENU: Record<string, string> = {
  'f-sushi': 'Sushi',
  'f-takoyaki': 'Takoyaki',
  'f-ramen': 'Ramen',
  'f-mochi': 'Mochi',
  'f-gyukatsu': 'Gyukatsu',
  'f-yakitori': 'Yakitori',
  'f-okonomiyaki': 'Okonomiyaki',
  'f-pancake': 'Cake',
  'f-cake': 'Cake',
};

// ── UI string translations ──────────────────────────────────────

const ui = {
  en: {
    // Main page
    'main.bingo': '{city} Bingo',
    'main.subtitle': 'Visit landmarks and take photos to complete bingo!',
    'main.loading': 'Loading...',
    'main.reset': 'Reset',
    'main.devComplete': '[DEV] Complete All',
    'main.confirmReset': 'Reset progress?',

    // Food page
    'food.back': '← Main Bingo',
    'food.title': 'Food Bingo',
    'food.subtitle': 'Complete 2 lines to auto-complete the main food cells!',
    'food.status': 'Lines completed: {done} / 2',
    'food.notification': 'Food bingo 2 lines done! Main food cells complete!',

    // Picture page
    'picture.back': '← Main Bingo',
    'picture.title': 'Hidden Picture',
    'picture.subtitle': 'Complete cells to reveal picture pieces',
    'picture.goBack': 'Go Back',

    // Place page
    'place.backMain': '← Main Bingo',
    'place.backFood': '← Food Bingo',
    'place.notFound': 'Page not found',
    'place.completed': 'Completed',
    'place.back': '← Back',

    // Sidebar
    'sidebar.title': 'Travel Bingo',
    'sidebar.mainProgress': 'Main Progress',
    'sidebar.bingoLines': 'Bingo Lines',
    'sidebar.bingoLinesValue': '{n} lines',
    'sidebar.hiddenPicture': 'Hidden Picture',
    'sidebar.reset': 'Reset',
    'sidebar.confirmReset': 'Reset all progress?',
    'sidebar.citySelect': 'Select City',

    // BingoCell
    'cell.hiddenPicture': 'Hidden picture',

    // FoodEntranceCell
    'food.entrance.label': 'Food Bingo',
    'food.entrance.complete': 'Complete!',

    // Food place list
    'food.recommended': 'Recommended Restaurants',
    'food.closedDay': 'Closed',
    'food.floor': 'Floor',
    'food.openMap': 'Google Map',

    // UploadButton
    'upload.change': 'Change Photo',
    'upload.upload': 'Upload Photo',
    'upload.uploading': 'Uploading...',
    'upload.dummy': 'Dummy Upload',

    // Celebration
    'celebration.title': 'Bingo Complete!',
    'celebration.revealing': 'Revealing hidden picture...',
    'celebration.congrats': 'Congratulations! You completed the {city} travel bingo!',
    'celebration.close': 'Close',

    // Tutorial box (center cell - Kyoto)
    'tutorial.ready': 'Ready to explore?',
    'tutorial.tap': 'Tap to start your bingo',
    'tutorial.notification': 'Let\'s make bingo!',
  },
  ko: {
    'main.bingo': '{city} 빙고',
    'main.subtitle': '명소를 방문하고 사진을 찍어 빙고를 완성하세요!',
    'main.loading': '로딩 중...',
    'main.reset': '초기화',
    'main.devComplete': '[DEV] 모두 완성',
    'main.confirmReset': '초기화하시겠습니까?',

    'food.back': '← 메인 빙고',
    'food.title': '음식 빙고',
    'food.subtitle': '2줄 완성 시 메인 빙고의 음식칸이 자동 완성됩니다!',
    'food.status': '완성된 줄: {done} / 2',
    'food.notification': '음식 빙고 2줄 달성! 메인 음식칸 완성!',

    'picture.back': '← 메인 빙고',
    'picture.title': '숨겨진 그림',
    'picture.subtitle': '셀을 완성하면 그림 조각이 공개됩니다',
    'picture.goBack': '돌아가기',

    'place.backMain': '← 메인 빙고',
    'place.backFood': '← 음식 빙고',
    'place.notFound': '페이지를 찾을 수 없습니다',
    'place.completed': '완성됨',
    'place.back': '← 돌아가기',

    'sidebar.title': '여행 빙고',
    'sidebar.mainProgress': '메인 진행',
    'sidebar.bingoLines': '빙고 라인',
    'sidebar.bingoLinesValue': '{n}줄',
    'sidebar.hiddenPicture': '숨겨진 그림',
    'sidebar.reset': '초기화',
    'sidebar.confirmReset': '모든 진행 상황을 초기화하시겠습니까?',
    'sidebar.citySelect': '도시 선택',

    'cell.hiddenPicture': '숨겨진 그림',

    'food.entrance.label': '음식 빙고',
    'food.entrance.complete': '완성!',

    'food.recommended': '추천 식당',
    'food.closedDay': '휴무',
    'food.floor': '층',
    'food.openMap': '구글맵',

    'upload.change': '📷 사진 변경',
    'upload.upload': '📷 사진 업로드',
    'upload.uploading': '업로드 중...',
    'upload.dummy': '📸 업로드 취급',

    'celebration.title': '빙고 완성!',
    'celebration.revealing': '숨겨진 그림 공개...',
    'celebration.congrats': '축하합니다! {city} 여행 빙고를 완성했습니다!',
    'celebration.close': '닫기',

    'tutorial.ready': '투어 준비되셨나요?',
    'tutorial.tap': '탭해서 빙고 시작하기',
    'tutorial.notification': '빙고를 만들어봐요!',
  },
} as const;

export type UiKey = keyof typeof ui.en;

// ── Cell translations (English only; Korean comes from constants.ts) ─

interface CellTr {
  label: string;
  sub?: string;
  description?: string;
}

const cellTranslations: Record<string, CellTr> = {
  // Osaka main cells
  wild:   { label: 'Wild', sub: 'Free Photo', description: 'Take a photo anywhere in the city!' },
  umeda:  { label: 'Umeda', sub: 'Sky Building', description: 'Enjoy the panoramic view from the Umeda Sky Building observatory.' },
  osaka:  { label: 'Osaka Castle', description: 'The iconic castle built by Toyotomi Hideyoshi.' },
  glico:  { label: 'Glico Man', sub: 'Dotonbori', description: 'Strike a pose in front of the famous Glico Running Man sign in Dotonbori!' },
  tsuten: { label: 'Tsutenkaku', description: 'Visit the Tsutenkaku Tower, symbol of Shinsekai.' },

  // Kyoto main cells
  nara:     { label: 'Nara Deer', sub: 'Nara Park', description: 'Visit Nara Park and meet the friendly deer.' },
  bamboo:   { label: 'Bamboo Grove', sub: 'Arashiyama', description: 'Walk through the enchanting bamboo grove in Arashiyama.' },
  nishiki:  { label: 'Nishiki Market', description: 'Explore Kyoto\'s famous Nishiki Market.' },
  kiyomizu: { label: 'Kiyomizudera', description: 'Visit the historic Kiyomizu-dera temple.' },

  // Osaka food cells
  'f-wild':        { label: 'The Most Delicious', description: 'Upload the most delicious food you had!' },
  'f-pancake':     { label: 'Cake', description: 'Enjoy a sweet cake.' },
  'f-takoyaki':    { label: 'Takoyaki', description: 'Osaka\'s soul food! Crispy, chewy takoyaki.' },
  'f-mochi':       { label: 'Strawberry Mochi', description: 'Enjoy sweet mochi with strawberry inside.' },
  'f-gyukatsu':    { label: 'Gyukatsu', description: 'Juicy wagyu beef cutlet with a crispy coating.' },
  'f-yakitori':    { label: 'Yakitori', description: 'Charcoal-grilled authentic yakitori.' },
  'f-sushi':       { label: 'Sushi', description: 'Fresh sushi with quality toppings.' },
  'f-ramen':       { label: 'Ramen', description: 'A bowl of rich tonkotsu ramen.' },
  'f-okonomiyaki': { label: 'Okonomiyaki', description: 'Osaka-style okonomiyaki is a must-try!' },

  // Kyoto food cells
  'f-cake':        { label: 'Cake', description: 'Enjoy a slice of Japanese cake.' },

  // Food entrance cells
  'food-1': { label: 'Food Bingo' },
  'food-2': { label: 'Food Bingo' },
  'food-3': { label: 'Food Bingo' },
  'food-4': { label: 'Food Bingo' },
};

// City name translations
const cityNames: Record<string, Record<Lang, string>> = {
  osaka: { en: 'Osaka', ko: '오사카' },
  kyoto: { en: 'Kyoto', ko: '교토' },
};

// ── Helper functions ────────────────────────────────────────────

import { CellConfig } from './types';

export function cellLabel(config: CellConfig, lang: Lang): string {
  if (lang === 'en') {
    return cellTranslations[config.id]?.label ?? config.label;
  }
  return config.label;
}

export function cellSub(config: CellConfig, lang: Lang): string {
  if (lang === 'en') {
    return cellTranslations[config.id]?.sub ?? config.sub;
  }
  return config.sub;
}

export function cellDescription(config: CellConfig, lang: Lang): string | undefined {
  if (lang === 'en') {
    return cellTranslations[config.id]?.description ?? config.description;
  }
  return config.description;
}

export function cityLabel(cityId: string, lang: Lang): string {
  return cityNames[cityId]?.[lang] ?? cityId;
}

export function createT(lang: Lang) {
  return function t(key: UiKey, vars?: Record<string, string | number>): string {
    let str: string = ui[lang][key] ?? ui.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}
