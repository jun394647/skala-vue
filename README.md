# skala-vue

SKALA Vue.js 종합실습 (4일차) 결과물입니다. Vue 3 + Vite 기반이며, 수업 실습 화면과 개인 커스텀 화면을 `App.vue`의 `MODE` 값으로 전환합니다.

## 화면 모드 (src/App.vue)

```js
const MODE = 'practice' // 'practice' | 'exercise' | 'farm'
```

- `practice` — 수업 시간에 만든 디렉티브·컴포넌트·라우터 등 예제 모음
- `exercise` — 채점 대상 과제 화면 (날씨 대시보드 → 컴포지션 → 컴포넌트 → 라우터/스토어/Axios)
- `farm` — 위 실습을 바탕으로 만든 개인 프로젝트, 농가용 날씨 대시보드 (품목별 위험 안내)

지금은 `exercise`로 되어 있습니다 (과제 제출 기준). 로컬에서 농가 날씨 화면을 보려면 `MODE`를 `'farm'`으로 바꾸면 됩니다.

## 배포 주소

https://jun394647.github.io/skala-vue/

## 환경 변수

`.env.local`에 아래 두 값이 필요합니다 (OpenWeatherMap API 키).

```
VITE_WEATHER_API_KEY=발급받은_32자리_키
VITE_OPENWEATHER_API_KEY=발급받은_32자리_키
```

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
