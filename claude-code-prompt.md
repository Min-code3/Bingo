# 🛠️ Travel Bingo 웹앱 리팩토링 프롬프트 (Claude Code용)

## 프로젝트 개요
기존 Travel Bingo 웹앱을 피벗합니다. 현재 코드베이스를 기반으로 구조를 변경합니다.
엎지 않고, 기존 코드를 수정합니다.

---

## 🔴 핵심 변경사항 (반드시 적용)

### 1. 페이지 구조 변경: 2페이지 + 바텀시트

**기존:** 메인빙고 → Food Bingo 페이지 → 식당 상세 페이지 (3뎁스)
**변경:** 랜딩페이지 + 빙고판 (2페이지만) + 나머지는 전부 바텀시트

#### Page 1: 랜딩 페이지 (신규 추가)
- 샘플 영상 자동재생 (루프, 음소거)
  - 영상 URL: `https://twkevftvombrvnwrladk.supabase.co/storage/v1/object/public/test/copy_E9DA0844-8512-4589-B28E-D7BCB7E04E1D.mov`
- 헤드카피: "Just explore, snap photos, and we'll do the rest."
- 서브카피: "We turn your trip into a memory like this."
- CTA 버튼: "Start Bingo →" (하단 고정)
- 도시 선택 기능 유지 (Osaka / Kyoto)
- 다국어 전환 버튼(EN) 유지

#### Page 2: 빙고판 (메인 화면)
- 3x3 그리드 (기존 3x3 유지하되, Food Bingo 페이지 제거)
- 모든 인터랙션은 바텀시트로 처리
- 상단: "[도시명] Bingo" + 진행 상태
- 하단: 프로그레스 (숫자 "0/9" 형태가 아닌, 시각적 프로그레스 바)
- 하단 텍스트: "2 lines → your highlight video ✨" (가볍게)
- Reset 버튼 제거 (또는 사이드바로 이동)

### 2. 빙고판 구성: 3x3 = 9칸

DB의 `image` 테이블에서 `box` 칼럼 값(1~9)이 빙고 칸 위치를 결정합니다.
- box 1 = 1행1열, box 2 = 1행2열, box 3 = 1행3열
- box 4 = 2행1열, box 5 = 2행2열(가운데), box 6 = 2행3열
- box 7 = 3행1열, box 8 = 3행2열, box 9 = 3행3열

**특이사항:**
- `id`가 공란인 데이터는 무시 (렌더링하지 않음)
- 교토의 경우 box 5 데이터가 없음 → box 5 칸은 자동으로 "완성된 상태"(hidden/auto-complete)로 처리

**가운데 칸 (box 5) 특별 처리 — 오사카:**
- 일러스트 대신 텍스트: "Ready to explore?"
- 서브텍스트: "Tap to start your bingo"
- 탭하면 사진 업로드 없이 자동으로 칸이 채워짐 (체크 애니메이션)
- 튜토리얼 역할: "이렇게 칸이 채워지는구나"를 보여줌

### 3. 칸 탭 동작: 바텀시트

칸을 탭하면 바텀시트가 올라옵니다. category에 따라 내용이 다릅니다.

#### (A) category = "main" (랜드마크) 칸 탭:
```
바텀시트 내용:
├── 일러스트 이미지 (작게)
├── 장소 이름 (영어 + 현지어)
├── 한줄 설명
├── "📸 Upload Photo" 버튼 (크게, 메인 CTA)
├── "📍 Open in Google Maps" 링크 (→ 새 탭에서 열림)
└── 이미 업로드한 경우: 업로드한 사진 미리보기 + "Replace Photo" 옵션
```
- `main` 테이블의 데이터를 참조하여 상세 정보 표시

#### (B) category = "food" (음식) 칸 탭:
```
바텀시트 내용:
├── 음식 일러스트 (작게)
├── 음식 이름 (영어 + 현지어)
├── 식당 리스트 3~4개 (food 테이블에서 해당 음식의 식당 데이터):
│   ├── 식당 이름
│   ├── 한줄 설명
│   ├── "Google Map →" 링크 (→ 새 탭에서 열림)
│   └── (반복)
├── "📸 Upload Food Photo" 버튼
└── 이미 업로드한 경우: 업로드한 사진 미리보기 + "Replace Photo" 옵션
```
- `food` 테이블의 데이터를 참조하여 식당 리스트 표시

#### (C) box 5 (가운데) 칸 탭:
- 바텀시트 없이 즉시 칸 완성 처리
- 체크 애니메이션 재생

### 4. 사진 업로드 플로우
- 바텀시트의 "Upload Photo" 버튼 탭 → 디바이스 갤러리 열림
- 사진 선택 → 바로 업로드 (크롭, 필터 없음)
- 업로드 완료 → 빙고 칸이 업로드한 사진 썸네일로 변경 + ✓ 체크 오버레이
- 짧은 축하 마이크로 인터랙션 (confetti 또는 체크 애니메이션)
- 1칸 = 1사진. 교체 가능.
- 바텀시트는 업로드 후 자동으로 닫힘

### 5. 칸 위에 장소/음식 이름 표시
- 각 빙고 칸의 일러스트 하단에 반투명 바 + 흰 글씨로 이름 표시
- 예: 오사카성 일러스트 하단에 "Osaka Castle" 오버레이
- 사진이 업로드되면 이름 오버레이는 사라지고 사진 썸네일 + ✓만 표시

### 6. 빙고 로직
```
3x3 빙고:
- 가로 3줄, 세로 3줄, 대각선 2줄 = 총 8줄 가능
- 2줄 완성 → 보상 트리거
- 9칸 전체 완성 → 프리미엄 보상 트리거
```

2줄 빙고 달성 시:
- 축하 애니메이션 (confetti)
- 빙고판 상단에 배너: "Your video is ready! 🎬" (탭하면 바텀시트)
- 바텀시트 내용: "We're creating your highlight video. We'll send it to you soon!"
- (실제 영상 전달은 수동 — 관리자가 후처리)

1줄 완성 시 넛지:
- 가볍게: "Nice! One more line and we'll create your video 🎬"

### 7. 사이드바 (신규 추가)
- 햄버거 메뉴 (기존 유지) 안에 추가:
  - **"My Photos"**: 유저가 업로드한 사진들을 모두 확인할 수 있는 갤러리
    - 각 사진은 어떤 칸에 업로드했는지 라벨 표시
    - 사진 탭하면 확대 보기
  - 도시 선택 (기존 유지)
  - 언어 전환 (기존 유지)

### 8. 유저 식별 (로그인 없이)
```javascript
// 첫 접속시 UUID 자동 생성, localStorage에 저장
let userId = localStorage.getItem('bingo_user_id');
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem('bingo_user_id', userId);
}
// 모든 API 요청에 userId를 포함
// 사진 업로드 시 userId를 함께 서버에 전송
```

### 9. 사진 사용 동의
- 랜딩 페이지의 "Start Bingo" 버튼 하단에 작은 텍스트:
  - "By continuing, you agree that your photos will be used to create your personal highlight video."
- 링크로 상세 약관 페이지 연결 (간단한 정적 페이지)

---

## 🟡 유지할 것 (건들지 마)

- 일러스트 스타일 및 에셋 (기존 이미지 그대로 사용)
- 빨간/크림 컬러 테마
- 다국어 기능 (EN 버튼)
- Supabase 연동 (DB, Storage)
- 도시 선택 기능 (Osaka / Kyoto)
- 기존 컬러 스킴, 폰트

---

## 🟢 DB 참조 방법

Google Sheets로 관리하는 3개 테이블이 있습니다:

### image 테이블 (빙고 메인)
- URL: https://docs.google.com/spreadsheets/d/1vUwyoT9mgYBFZr5EkRWNk7PEXXpZKTORQzcwgBtFJY4/edit?gid=687563270#gid=687563270
- 역할: 빙고 칸 데이터. 각 row가 빙고 칸 하나.
- 주요 칼럼:
  - `id`: 고유 식별자 (공란이면 무시)
  - `box`: 빙고 칸 위치 (1~9)
  - `category`: "main" (랜드마크) 또는 "food" (음식)
  - `city`: 도시 구분
  - 일러스트 이미지 URL 등

### food 테이블 (식당 데이터)
- URL: https://docs.google.com/spreadsheets/d/1vUwyoT9mgYBFZr5EkRWNk7PEXXpZKTORQzcwgBtFJY4/edit?gid=1570588835#gid=1570588835
- 역할: image 테이블에서 category="food"인 칸을 탭했을 때 보여줄 식당 리스트
- image의 해당 food 항목과 연결

### main 테이블 (랜드마크 상세)
- URL: https://docs.google.com/spreadsheets/d/1vUwyoT9mgYBFZr5EkRWNk7PEXXpZKTORQzcwgBtFJY4/edit?gid=457233886#gid=457233886
- 역할: image 테이블에서 category="main"인 칸을 탭했을 때 보여줄 장소 상세 정보
- image의 해당 main 항목과 연결

---

## 🔵 기술 참고사항

- 기존 프로젝트 구조와 프레임워크를 유지
- Food Bingo 페이지 관련 코드/라우트 제거
- 바텀시트는 모달 또는 slide-up 패널로 구현 (라이브러리 사용 가능)
- 사진 업로드는 Supabase Storage 사용 (기존 로직 활용)
- UUID는 localStorage 기반
- 모바일 최적화 필수 (주 사용 환경이 모바일 브라우저)

---

## ⚠️ 특이사항 정리

1. `id`가 공란인 데이터는 렌더링하지 않음
2. 교토의 경우 box 5 데이터가 없음 → box 5 칸은 자동 완성 처리 (hidden image 사용)
3. 영상 배포는 수동 (앱 내 자동 영상 생성 기능 불필요)
4. 빙고 2줄 달성 알림은 UI에서만 표시 (관리자 알림은 추후)

---

## 작업 순서 제안

1. Food Bingo 페이지 제거 + 바텀시트 구조로 전환
2. 랜딩 페이지 추가 (영상 + CTA)
3. box 5 (가운데 칸) 특별 처리
4. 칸 이름 오버레이 추가
5. 빙고 로직 수정 (3x3, 2줄 조건)
6. 사이드바에 "My Photos" 추가
7. UUID 기반 유저 식별 추가
8. 프로그레스 바 UI 개선
9. 마이크로 인터랙션 (체크 애니메이션, confetti)
