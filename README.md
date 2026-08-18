# skala-vue

SKALA Vue.js 종합실습 (4일차) 결과물입니다. Vue 3 + Vite 기반이며, 수업 실습 화면과 개인 커스텀 화면을 `App.vue`의 `MODE` 값으로 전환합니다.

## 화면 모드 (src/App.vue)

```js
const MODE = 'practice' // 'practice' | 'exercise' | 'farm'
```

| MODE | 화면 | 자세히 |
|---|---|---|
| `practice` | 수업 시간에 만든 디렉티브·컴포넌트·라우터 등 예제 모음 | [docs/practice.md](./docs/practice.md) |
| `exercise` | 채점 대상 과제 + 이를 바탕으로 확장한 러닝 날씨 서비스 | [docs/assignment.md](./docs/assignment.md) · [docs/running.md](./docs/running.md) |
| `farm` | 개인 프로젝트, 농가용 날씨 대시보드 (작물별 위험 안내) | [docs/farm.md](./docs/farm.md) |

지금은 `exercise`로 되어 있습니다 (과제 제출 기준). 과제만 딱 끝낸 시점(러닝 서비스로 확장되기 전)은 [`submission-guide-only`](https://github.com/jun394647/skala-vue/tree/submission-guide-only) 브랜치에 별도로 보존해뒀습니다.

## 배포 주소

- GitHub Pages(과제 제출 기준): https://jun394647.github.io/skala-vue/
- Vercel(개인용 미러): https://skala-vue-plum-sigma.vercel.app

## 환경 변수

`.env.local`에 아래 값이 필요합니다. `.env.example`에 형식이 정리돼 있습니다.

```
VITE_WEATHER_API_KEY=OpenWeatherMap 키
VITE_OPENWEATHER_API_KEY=OpenWeatherMap 키
VITE_YOUTUBE_API_KEY=YouTube Data API v3 키 (러닝 음악 추천)
VITE_MOVIE_API_KEY=카카오 JavaScript 키 (러닝 코스 지도)
ORS_API_KEY=OpenRouteService 키 (러닝 코스 실도로 경로, 서버 전용 — Vercel에만 등록, VITE_ 접두사 없음)
```

`VITE_` 접두사 키는 빌드 시 클라이언트 번들에 그대로 포함됩니다. GitHub Secret Scanning이 `VITE_YOUTUBE_API_KEY`를 공개 노출로 탐지해(2026-08-13) 키를 재발급하고 Google Cloud Console에서 HTTP 리퍼러를 배포 도메인으로 제한했습니다(2026-08-18).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Deploy to GitHub Pages

```sh
npm run deploy
```

### Deploy to Vercel

```sh
npx vercel --prod
```
