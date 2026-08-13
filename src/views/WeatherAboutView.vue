<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <h3>ℹ️ 서비스 소개</h3>
    <hr />

    <div class="description-box">
      <p>
        <strong>Vue 3</strong> + <strong>Vue Router 4</strong> + <strong>Pinia</strong> 기반으로 만든 러닝
        전용 날씨 대시보드입니다. 실시간 날씨를 확인하는 걸 넘어서, 오늘 뛰기 좋은 날인지·어떤 옷을 입어야
        하는지·어느 코스로 얼마나 뛰면 좋은지까지 한 번에 보여주는 게 목표입니다.
      </p>
      <ul>
        <li>🏃 러닝 대시보드 — 오늘의 한마디, 현재 위치 기반 코스 추천(실도로 경로 + 업힐/칼로리 추정), 날씨에 맞는 음악 추천</li>
        <li>🌦️ 날씨 대시보드 — 현재 위치 3시간 단기예보, 도시 검색·즐겨찾기, 실시간 날씨 카드</li>
        <li>⚙️ 설정 — 다크모드, 섭씨/화씨 단위 전환, 즐겨찾기 초기화</li>
        <li>클라이언트 사이드 라우팅·URL 쿼리 스트링 동기화로 새로고침 없는 화면 전환</li>
      </ul>
      <p class="api-credit">
        날씨: OpenWeatherMap · 명언: Advice Slip API · 음악: YouTube Data API v3 · 지도: 카카오맵 · 실도로 경로: OpenRouteService
      </p>
    </div>

    <button @click="handleGoHome" class="home-btn">대시보드 홈으로 이동</button>
  </div>
</template>

<style scoped>
.description-box {
  background-color: var(--ex-input-bg, #f8f9fa);
  color: var(--ex-text, #2c3e50);
  padding: 12px;
  border-radius: 6px;
  line-height: 1.5;
  font-size: var(--ex-font-sm, 14px);
}

ul {
  padding-left: 20px;
  margin: 8px 0 0 0;
}

li {
  margin-bottom: 6px;
  color: var(--ex-text-soft, #555);
}

.api-credit {
  margin-top: 10px;
  font-size: var(--ex-font-xs, 12px);
  color: var(--ex-text-soft, #7f8c8d);
}

.home-btn {
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: var(--ex-font-sm, 14px);
  font-weight: bold;
  cursor: pointer;
}
</style>
