# 코드 프렉티스 (`MODE = 'practice'`)

수업(SKALA Full-Stack Engineering / Frontend Vue.js) 진도를 따라가며 만든 Vue 3 기본기 예제 모음입니다. 채점 대상은 아니고, 각 문법/개념을 하나씩 검증해보는 용도입니다. `src/PracticeApp.vue`가 아래 컴포넌트를 전부 화면에 늘어놓고 보여줍니다.

## 구성

| 폴더 | 내용 |
|---|---|
| `src/components/practices/basic/` | 템플릿 문법 — `v-text`, `v-html`(+XSS 주의 비교), `v-bind`(클래스/스타일/축약형), `v-if`/`v-show`, `v-for`, `v-pre`/`v-cloak`/`v-once`/`v-memo`, 이벤트 처리(`@click` 기본/객체/수식어), `v-model`(기본/폼/수식어), `<style scoped>` |
| `src/components/practices/composition/` | Composition API — `ref`/`reactive`, `computed`, `watch`(기본/deep/다중 소스/reactive 객체·배열/ref 배열), `watchEffect` |
| `src/components/practices/component/` | 컴포넌트 통신 — `props`/`emits`, 슬롯(기본/named/scoped), 라이프사이클 훅(부모-자식) |
| `src/components/practices/library/` | 외부 라이브러리 — Axios(JSON, 날씨 API), Element Plus, Pinia(`StoreCounter`), ES2022+ 문법 정리(`EcmaScript.vue`, `.question`/`.answer` 쌍은 실습 문제/정답 버전) |

## 실행

```js
// src/App.vue
const MODE = 'practice'
```

로 바꾸고 `npm run dev`. 각 예제는 독립적이라 서로 상태를 공유하지 않습니다.

## 주의

`src/components/practices/library/AxiosWeather.vue`는 한때 API 키가 하드코딩돼 있던 파일입니다 — 지금은 `import.meta.env.VITE_OPENWEATHER_API_KEY`로 옮겨졌습니다. 새 실습 파일을 추가할 때 키를 직접 박아넣지 않도록 주의하세요.
