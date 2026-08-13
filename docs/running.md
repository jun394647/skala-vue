# 러닝 날씨 (`MODE = 'exercise'`, 최종 서비스 형태)

과제 ④⑤⑥(라우터·Pinia·Axios)을 뼈대로, 가이드 범위를 넘어선 개인 기능을 얹어 "러닝하는 사람을 위한 날씨 서비스"로 확장한 화면입니다. 채점 대상 코드와 같은 화면을 공유하며, 어떤 부분이 과제이고 어떤 부분이 추가 기능인지는 코드 주석(`// 과제 N: ...` / `// 가이드 범위를 넘어선 추가 기능 — ...`)으로 구분해뒀습니다. 과제 부분만 보려면 [assignment.md](./assignment.md) 참고.

## 화면 구성 (`src/ExerciseApp.vue` 내비게이션)

| 메뉴 | 경로 | 내용 |
|---|---|---|
| 🏃 러닝 대시보드 | `/running` | 오늘의 러닝 한마디, 내 주변 러닝 코스 추천, 날씨 기반 러닝 음악 추천 |
| 🌦️ 날씨 대시보드 | `/` | 도시 검색(+최근 검색어), 즐겨찾기 필터, 서울/수원/부산 실시간 날씨 카드 |
| ℹ️ 서비스 소개 | `/about` | 프로젝트 설명 |
| ⚙️ 설정 | `/settings` | 다크모드, 단위(℃/℉) 전환, 즐겨찾기 초기화 |

## 러닝 대시보드 기능

- **오늘의 러닝 한마디**: [Advice Slip API](https://api.adviceslip.com)에서 랜덤 문구, 화살표 버튼으로 다음 문장
- **내 주변 러닝 코스 추천**: 브라우저 Geolocation → 현재 위치 날씨(OpenWeatherMap) → 기온/강수량/풍속 기준으로 3~5km 코스 추천 → 카카오맵(JS SDK)에 현재 위치를 시작/끝점으로 하는 원형 루프 표시 + 옷차림 추천 + 일출/일몰 시각 + "카카오맵 앱에서 보기" 링크
  - 강수량 2mm/h 미만(가는 비)은 야외 러닝 유지, 그 이상만 실내 대체 추천
- **러닝 음악 추천**: 평균 기온·강수 여부로 무드를 정하고 YouTube Data API v3(`search.list`)로 영상 1개 임베드

## 날씨 대시보드 기능

- 도시 검색(쿼리스트링 동기화, 최근 검색어 최대 5개 칩 — `localStorage`)
- 즐겨찾기(Pinia `favoritesStore`) 토글 시 토스트 알림, "즐겨찾기만 보기" 필터
- 카드 클릭 시 상세 페이지(`/weather/:cityId`)로 이동 — 동적 세그먼트(과제 ④) 재사용

## 상태 관리 (Pinia)

| 스토어 | 역할 |
|---|---|
| `configStore` | 섭씨/화씨 단위 (과제 ⑤) |
| `favoritesStore` | 즐겨찾기 도시 목록 |
| `uiStore` | 다크모드 on/off (`localStorage` 영속) |

## 외부 API

| API | 용도 | 필요 env |
|---|---|---|
| OpenWeatherMap `/weather` | 도시별·좌표별 실시간 날씨 | `VITE_WEATHER_API_KEY`, `VITE_OPENWEATHER_API_KEY` |
| Advice Slip API | 러닝 한마디 | 없음(무료, 키 불필요) |
| YouTube Data API v3 | 러닝 음악 추천 | `VITE_YOUTUBE_API_KEY` |
| Kakao Maps JS SDK | 러닝 코스 지도 표시 | `VITE_MOVIE_API_KEY`(카카오 JavaScript 키) |

카카오 키를 쓰려면 [카카오 디벨로퍼스](https://developers.kakao.com)에서:
1. 앱 생성 → **제품 설정 > 카카오맵 > 사용 설정 ON** (안 켜면 `OPEN_MAP_AND_LOCAL service disabled` 403 에러)
2. **플랫폼 > Web**에 배포 도메인 등록: `https://jun394647.github.io`, `https://skala-vue-plum-sigma.vercel.app`, `http://localhost:3000`

## 배포

- GitHub Pages(과제 제출 기준): https://jun394647.github.io/skala-vue/
- Vercel(개인용 미러, 커스텀 도메인 리다이렉션 실험용): https://skala-vue-plum-sigma.vercel.app

두 배포 모두 같은 코드베이스를 씁니다. `vite.config.js`가 `VERCEL` 환경변수 유무로 `base` 경로를 자동 분기(`/skala-vue/` vs `/`)합니다.
