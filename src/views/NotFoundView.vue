<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-icon">☀️❓</div>

      <h2>페이지를 찾을 수 없습니다.</h2>
      <p>요청하신 주소가 존재하지 않거나,<br />아직 개발되지 않았습니다.</p>

      <button class="home-button" @click="goHome">날씨 메인으로 이동</button>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: var(--ex-page-bg, #f8f9fa);
  font-family: 'Noto Sans KR', sans-serif;
}

.not-found-content {
  text-align: center;
  background-color: var(--ex-card-bg, #ffffff);
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--ex-border, #e9ecef);
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ex-text, #343a40);
  margin-bottom: 15px;
  letter-spacing: -0.5px;
}

p {
  font-size: 1.1rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 35px;
}

.home-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 30px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.home-button:hover {
  background-color: #0056b3;
}

.home-button:active {
  transform: scale(0.98);
}
</style>
