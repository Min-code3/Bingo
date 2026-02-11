import { CellConfig } from './types';

// Main 3x3 grid cells — food mega split into 4 entrance cells
export const MAIN_CELLS: CellConfig[] = [
  { id: 'wild',   label: 'BEST',     sub: '자유사진',   icon: '🌸', grad: 'linear-gradient(135deg,#FFB7C5,#FF85A2)', pp: '0% 0%',   ps: '300% 300%', image: '/images/cells/wild.png',   description: '자유롭게 오사카의 아무 장소에서 사진을 찍어보세요!', mapQuery: 'Osaka,Japan' },
  { id: 'umeda',  label: '우메다',    sub: '스카이빌딩', icon: '🌃', grad: 'linear-gradient(135deg,#1a1a2e,#0f3460)', pp: '50% 0%',  ps: '300% 300%', image: '/images/cells/umeda.png',  description: '우메다 스카이빌딩의 공중정원 전망대에서 오사카 전경을 감상하세요.', mapQuery: 'Umeda+Sky+Building+Osaka', klookUrl: 'https://www.klook.com/activity/5932-umeda-sky-building-osaka/' },
  { id: 'osaka',  label: '오사카성',   sub: '',          icon: '🏯', grad: 'linear-gradient(135deg,#f5af19,#f12711)', pp: '100% 0%', ps: '300% 300%', image: '/images/cells/osaka.png',  description: '도요토미 히데요시가 세운 오사카의 상징적인 성입니다.', mapQuery: 'Osaka+Castle', klookUrl: 'https://www.klook.com/activity/1441-osaka-castle-osaka/' },
  { id: 'glico',  label: '글리코상',   sub: '도톤보리',   icon: '🏃', grad: 'linear-gradient(135deg,#ee0979,#ff6a00)', pp: '0% 50%',  ps: '300% 300%', image: '/images/cells/glico.png',  description: '도톤보리의 유명한 글리코 러닝맨 간판 앞에서 포즈를 취하세요!', mapQuery: 'Glico+Man+Sign+Dotonbori' },
  { id: 'food-1', label: '음식 빙고', sub: '',          icon: '🍽️', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '50% 50%', ps: '300% 300%' },
  { id: 'food-2', label: '음식 빙고', sub: '',          icon: '🍜', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '100% 50%',ps: '300% 300%' },
  { id: 'tsuten', label: '츠텐카쿠',   sub: '',          icon: '🗼', grad: 'linear-gradient(135deg,#00b4db,#0083b0)', pp: '0% 100%', ps: '300% 300%', image: '/images/cells/tsuten.png', description: '신세카이의 상징 츠텐카쿠 타워를 방문하세요.', mapQuery: 'Tsutenkaku+Tower+Osaka', klookUrl: 'https://www.klook.com/activity/1444-tsutenkaku-tower-osaka/' },
  { id: 'food-3', label: '음식 빙고', sub: '',          icon: '🍣', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '50% 100%',ps: '300% 300%' },
  { id: 'food-4', label: '음식 빙고', sub: '',          icon: '🥘', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '100% 100%',ps: '300% 300%' },
];

// Main cell IDs that are real places (not food entrance)
export const PLACE_CELL_IDS = ['wild', 'umeda', 'osaka', 'glico', 'tsuten'];
export const FOOD_ENTRANCE_IDS = ['food-1', 'food-2', 'food-3', 'food-4'];

export const FOOD_CELLS: CellConfig[] = [
  { id: 'f-sushi',      label: '스시',          sub: '',           icon: '🍣', grad: 'linear-gradient(135deg,#ff6b6b,#ee5a24)', pp: '', ps: '', description: '신선한 네타의 오사카 스시를 맛보세요.' },
  { id: 'f-takoyaki',   label: '타코야키',      sub: '',           icon: '🐙', grad: 'linear-gradient(135deg,#c04848,#6a1b1b)', pp: '', ps: '', description: '오사카의 소울푸드! 바삭하고 쫄깃한 타코야키.' },
  { id: 'f-ramen',      label: '라멘',          sub: '',           icon: '🍜', grad: 'linear-gradient(135deg,#f7e98e,#b8860b)', pp: '', ps: '', description: '진한 돈코츠 라멘 한 그릇의 행복.' },
  { id: 'f-mochi',      label: '딸기모찌',      sub: '',           icon: '🍓', grad: 'linear-gradient(135deg,#ff9a9e,#fad0c4)', pp: '', ps: '', description: '달콤한 딸기가 쏙 들어간 모찌를 즐기세요.' },
  { id: 'f-wild',       label: '가장 맛있었던', sub: '',           icon: '🍽️', grad: 'linear-gradient(135deg,#ffd200,#f7971e)', pp: '', ps: '', description: '가장 맛있었던 음식을 자유롭게 올려주세요!' },
  { id: 'f-pancake',    label: '케이크',        sub: '',           icon: '🍰', grad: 'linear-gradient(135deg,#f5e6ca,#d4a56a)', pp: '', ps: '', description: '달콤한 케이크를 맛보세요.' },
  { id: 'f-okonomiyaki',label: '오코노미야끼',   sub: '',           icon: '🥘', grad: 'linear-gradient(135deg,#8B6914,#654321)', pp: '', ps: '', description: '오사카식 오코노미야끼는 꼭 먹어봐야 합니다!' },
  { id: 'f-gyukatsu',   label: '규카츠',        sub: '',           icon: '🥩', grad: 'linear-gradient(135deg,#8e2024,#4a0e10)', pp: '', ps: '', description: '바삭한 튀김옷에 육즙 가득한 와규 규카츠.' },
  { id: 'f-yakitori',   label: '야끼토리',      sub: '',           icon: '🍢', grad: 'linear-gradient(135deg,#f7971e,#a84300)', pp: '', ps: '', description: '숯불에 구운 정통 야끼토리를 즐기세요.' },
];

// Bingo lines for the 3x3 main grid (using index positions)
// Grid layout:
// [0:wild]   [1:umeda]  [2:osaka]
// [3:glico]  [4:food-1] [5:food-2]
// [6:tsuten] [7:food-3] [8:food-4]
export const MAIN_LINES: string[][] = [
  // rows
  ['wild', 'umeda', 'osaka'],
  ['glico', 'food-1', 'food-2'],
  ['tsuten', 'food-3', 'food-4'],
  // cols
  ['wild', 'glico', 'tsuten'],
  ['umeda', 'food-1', 'food-3'],
  ['osaka', 'food-2', 'food-4'],
  // diagonals
  ['wild', 'food-1', 'food-4'],
  ['osaka', 'food-1', 'tsuten'],
];

export const FOOD_LINES: number[][] = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // cols
  [0,4,8],[2,4,6],          // diags
];

// === 교토 ===
export const KYOTO_CELLS: CellConfig[] = [
  { id: 'wild',   label: 'Wild',      sub: '자유사진',   icon: '🌸', grad: 'linear-gradient(135deg,#FFB7C5,#FF85A2)', pp: '0% 0%',   ps: '300% 300%' },
  { id: 'nara',   label: '나라 사슴',  sub: '나라공원',   icon: '🦌', grad: 'linear-gradient(135deg,#8B6914,#D4A574)', pp: '50% 0%',  ps: '300% 300%' },
  { id: 'bamboo', label: '대나무숲',   sub: '아라시야마',  icon: '🎋', grad: 'linear-gradient(135deg,#2d5016,#6b8f3c)', pp: '100% 0%', ps: '300% 300%' },
  { id: 'nishiki',label: '니시키 시장', sub: '',           icon: '🏪', grad: 'linear-gradient(135deg,#c0392b,#e74c3c)', pp: '0% 50%',  ps: '300% 300%' },
  { id: 'food-1', label: '음식 빙고', sub: '',          icon: '🍽️', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '50% 50%', ps: '300% 300%' },
  { id: 'food-2', label: '음식 빙고', sub: '',          icon: '🍜', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '100% 50%',ps: '300% 300%' },
  { id: 'kiyomizu',label:'기요미즈데라',sub: '',           icon: '⛩️', grad: 'linear-gradient(135deg,#B91C1C,#FF6B6B)', pp: '0% 100%', ps: '300% 300%' },
  { id: 'food-3', label: '음식 빙고', sub: '',          icon: '🍣', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '50% 100%',ps: '300% 300%' },
  { id: 'food-4', label: '음식 빙고', sub: '',          icon: '🥘', grad: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', pp: '100% 100%',ps: '300% 300%' },
];

export const KYOTO_PLACE_IDS = ['wild', 'nara', 'bamboo', 'nishiki', 'kiyomizu'];

export const KYOTO_FOOD_CELLS: CellConfig[] = [
  { id: 'f-sushi',      label: '스시',          sub: '',           icon: '🍣', grad: 'linear-gradient(135deg,#ff6b6b,#ee5a24)', pp: '', ps: '', description: '신선한 네타의 교토 스시를 맛보세요.' },
  { id: 'f-takoyaki',   label: '타코야키',      sub: '',           icon: '🐙', grad: 'linear-gradient(135deg,#c04848,#6a1b1b)', pp: '', ps: '', description: '바삭하고 쫄깃한 타코야키.' },
  { id: 'f-ramen',      label: '라멘',          sub: '',           icon: '🍜', grad: 'linear-gradient(135deg,#f7e98e,#b8860b)', pp: '', ps: '', description: '진한 돈코츠 라멘 한 그릇의 행복.' },
  { id: 'f-mochi',      label: '딸기모찌',      sub: '',           icon: '🍓', grad: 'linear-gradient(135deg,#ff9a9e,#fad0c4)', pp: '', ps: '', description: '달콤한 딸기가 쏙 들어간 모찌를 즐기세요.' },
  { id: 'f-wild',       label: '가장 맛있었던', sub: '',           icon: '🍽️', grad: 'linear-gradient(135deg,#ffd200,#f7971e)', pp: '', ps: '', description: '가장 맛있었던 음식을 자유롭게 올려주세요!' },
  { id: 'f-pancake',    label: '케이크',        sub: '',           icon: '🍰', grad: 'linear-gradient(135deg,#f5e6ca,#d4a56a)', pp: '', ps: '', description: '달콤한 케이크를 맛보세요.' },
  { id: 'f-okonomiyaki',label: '오코노미야끼',   sub: '',           icon: '🥘', grad: 'linear-gradient(135deg,#8B6914,#654321)', pp: '', ps: '', description: '교토식 오코노미야끼는 꼭 먹어봐야 합니다!' },
  { id: 'f-gyukatsu',   label: '규카츠',        sub: '',           icon: '🥩', grad: 'linear-gradient(135deg,#8e2024,#4a0e10)', pp: '', ps: '', description: '바삭한 튀김옷에 육즙 가득한 와규 규카츠.' },
  { id: 'f-yakitori',   label: '야끼토리',      sub: '',           icon: '🍢', grad: 'linear-gradient(135deg,#f7971e,#a84300)', pp: '', ps: '', description: '숯불에 구운 정통 야끼토리를 즐기세요.' },
];

export const KYOTO_LINES: string[][] = [
  ['wild', 'nara', 'bamboo'],
  ['nishiki', 'food-1', 'food-2'],
  ['kiyomizu', 'food-3', 'food-4'],
  ['wild', 'nishiki', 'kiyomizu'],
  ['nara', 'food-1', 'food-3'],
  ['bamboo', 'food-2', 'food-4'],
  ['wild', 'food-1', 'food-4'],
  ['bamboo', 'food-1', 'kiyomizu'],
];

// === 도시 설정 ===
export interface CityConfig {
  id: string;
  label: string;
  mainCells: CellConfig[];
  placeIds: string[];
  foodCells: CellConfig[];
  mainLines: string[][];
}

export const CITIES: Record<string, CityConfig> = {
  osaka: {
    id: 'osaka', label: '오사카',
    mainCells: MAIN_CELLS, placeIds: PLACE_CELL_IDS,
    foodCells: FOOD_CELLS, mainLines: MAIN_LINES,
  },
  kyoto: {
    id: 'kyoto', label: '교토',
    mainCells: KYOTO_CELLS, placeIds: KYOTO_PLACE_IDS,
    foodCells: KYOTO_FOOD_CELLS, mainLines: KYOTO_LINES,
  },
};

export const HIDDEN_SVG = `<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#1a0533"/><stop offset="20%" stop-color="#FF6B35"/>
<stop offset="40%" stop-color="#FF8C42"/><stop offset="55%" stop-color="#FFD700"/>
<stop offset="75%" stop-color="#87CEEB"/><stop offset="100%" stop-color="#4682B4"/>
</linearGradient></defs>
<rect width="600" height="600" fill="url(#s)"/>
<circle cx="50" cy="30" r="2" fill="#fff" opacity=".7"/>
<circle cx="150" cy="50" r="1.5" fill="#fff" opacity=".5"/>
<circle cx="550" cy="40" r="2" fill="#fff" opacity=".6"/>
<circle cx="420" cy="170" r="50" fill="#FF4500" opacity=".85"/>
<circle cx="420" cy="170" r="35" fill="#FFD700" opacity=".6"/>
<polygon points="0,480 120,300 240,420 360,310 480,380 600,280 600,600 0,600" fill="#2F4F4F" opacity=".4"/>
<polygon points="120,600 300,220 480,600" fill="#4a5568"/>
<polygon points="230,340 300,220 370,340" fill="#E8E8E8" opacity=".9"/>
<rect x="0" y="490" width="600" height="110" fill="#1a365d" opacity=".5"/>
<rect x="65" y="360" width="14" height="240" fill="#C41E3A" rx="3"/>
<rect x="165" y="360" width="14" height="240" fill="#C41E3A" rx="3"/>
<rect x="50" y="350" width="145" height="12" fill="#C41E3A" rx="4"/>
<rect x="60" y="370" width="125" height="8" fill="#C41E3A" rx="2"/>
<g fill="#FFB7C5" opacity=".85">
<circle cx="520" cy="100" r="6"/><circle cx="540" cy="125" r="5"/><circle cx="500" cy="135" r="7"/>
<circle cx="530" cy="75" r="4"/><circle cx="510" cy="160" r="5"/><circle cx="70" cy="100" r="5"/>
<circle cx="90" cy="75" r="4"/><circle cx="50" cy="130" r="6"/><circle cx="110" cy="115" r="3"/>
</g>
<rect x="272" y="430" width="3" height="25" fill="#8B4513"/>
<rect x="262" y="455" width="23" height="30" fill="#FF4500" rx="5" opacity=".85"/>
<rect x="332" y="420" width="3" height="25" fill="#8B4513"/>
<rect x="322" y="445" width="23" height="30" fill="#FF4500" rx="5" opacity=".85"/>
</svg>`;
