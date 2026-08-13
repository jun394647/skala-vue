# 과제 (`MODE = 'exercise'`, 채점 대상)

SKALA 종합실습가이드 4일차(Day1 Mockup → Day2 Composition/컴포넌트 분리 → Day3 Router/Pinia/Axios → Day4 빌드/배포) 과제입니다. 각 과제 코드는 지우지 않고 그대로 남겨뒀고, 실제 화면(`src/ExerciseApp.vue`)은 과제 ④⑤⑥이 통합된 대시보드 하나로 보여줍니다.

가이드만 딱 끝낸 시점(러닝 서비스로 확장되기 전)은 `submission-guide-only` 브랜치에 별도로 고정해뒀습니다. 지금 `main`은 그 이후로 계속 개인 프로젝트(러닝 날씨 서비스)로 발전한 버전입니다.

## 과제 ↔ 파일 매핑

| 과제 | 내용 | 파일 |
|---|---|---|
| ① | Mockup — `v-for`+`:key`, `v-if`/`v-else`, `:value`+`@input`(한글 조합 처리), `@click.stop` | `src/components/exercise/WeatherMockup.vue` |
| ② | 컴포지션 — `computed`(검색 필터), `watch`(상태바), `watchEffect`(자동 추적) | `src/components/exercise/WeatherComposition.vue` |
| ③ | 컴포넌트 분리 — `BaseDashboardCard`(slot), `SearchBar`(props/emits), `WeatherCard`(props/emits) | `src/components/exercise/WeatherParent.vue` + `BaseDashboardCard.vue`/`SearchBar.vue`/`WeatherCard.vue` |
| ④ | Vue Router — routes 4개(동적 세그먼트, 쿼리 스트링, catch-all), 지연 로딩 | `src/router/index.js` |
| ⑤ | Pinia 스토어 — 섭씨/화씨 단위를 여러 컴포넌트가 공유 | `src/stores/configStore.js` |
| ⑥ | Axios 실시간 API 연동 — `Promise.all` 병렬 요청, `isLoading`/에러 처리 | `src/views/WeatherHomeView.vue` |
| ④+⑤+⑥ | 동적 세그먼트(`cityId`) 상세 조회 + Pinia 단위 전환 + Axios 단건 요청 조합 | `src/views/WeatherDetailView.vue` |

①·②·③은 화면에서 직접 렌더링하진 않지만(최종 화면은 ④⑤⑥ 통합본), 파일은 그대로 살아있어 코드로 확인 가능합니다.

## 채점 기준 관련

- ESLint 0 errors (`npm run lint`)
- API 키는 `.env.local`(gitignore)로 분리, 저장소엔 `.env.example`만 커밋
- GitHub Pages 배포: https://jun394647.github.io/skala-vue/ (`vite.config.js`의 `base: '/skala-vue/'`, `createWebHistory(import.meta.env.BASE_URL)` 필수 — 안 하면 서브패스에서 라우팅이 깨짐)

## 실행

```js
// src/App.vue
const MODE = 'exercise'
```

(현재 기본값입니다.)
