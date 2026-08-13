<script setup>
// 가이드 범위를 넘어선 추가 기능 — 러닝 한마디·러닝 음악 추천·러닝 코스 추천을 한 화면에 모은 러닝 대시보드
import { ref, onMounted } from 'vue'
import axios from 'axios'

import RunningMusicCard from '../components/exercise/RunningMusicCard.vue'
import RunningRouteCard from '../components/exercise/RunningRouteCard.vue'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const ADVICE_URL = 'https://api.adviceslip.com/advice'

const weatherList = ref([])
const runningQuote = ref('')
const isQuoteLoading = ref(false)

const fetchRunningQuote = async () => {
  isQuoteLoading.value = true
  try {
    const response = await axios.get(ADVICE_URL)
    runningQuote.value = response.data.slip.advice
  } catch (error) {
    console.error('🔴 러닝 한마디 로딩 실패:', error)
    runningQuote.value = '오늘도 가볍게 한 걸음부터 시작해봐요.'
  } finally {
    isQuoteLoading.value = false
  }
}

const fetchWeatherForMood = async () => {
  try {
    const [seoulRes, suwonRes, busanRes] = await Promise.all([
      axios.get(`${BASE_URL}?q=Seoul&appid=${API_KEY}&units=metric&lang=kr`),
      axios.get(`${BASE_URL}?q=Suwon&appid=${API_KEY}&units=metric&lang=kr`),
      axios.get(`${BASE_URL}?q=Busan&appid=${API_KEY}&units=metric&lang=kr`),
    ])
    weatherList.value = [
      { id: 'city_01', name: '서울', temp: seoulRes.data.main.temp, status: seoulRes.data.weather[0].description },
      { id: 'city_02', name: '수원', temp: suwonRes.data.main.temp, status: suwonRes.data.weather[0].description },
      { id: 'city_03', name: '부산', temp: busanRes.data.main.temp, status: busanRes.data.weather[0].description },
    ]
  } catch (error) {
    console.error('🔴 러닝 음악 추천용 날씨 조회 실패:', error)
  }
}

onMounted(() => {
  fetchRunningQuote()
  fetchWeatherForMood()
})
</script>

<template>
  <div class="running-dashboard">
    <div class="quote-panel">
      <p class="quote-text">
        <template v-if="isQuoteLoading">불러오는 중...</template>
        <template v-else>“{{ runningQuote }}”</template>
      </p>
      <button
        class="quote-next-btn"
        :disabled="isQuoteLoading"
        aria-label="다음 문장 보기"
        @click="fetchRunningQuote"
      >
        →
      </button>
    </div>

    <RunningRouteCard />

    <RunningMusicCard :weather-list="weatherList" />
  </div>
</template>

<style scoped>
.running-dashboard {
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  margin: 0 auto;
}
.quote-panel {
  position: relative;
  margin-bottom: 15px;
  padding: 36px 56px 30px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1f9d6b, #1a7ea8);
  box-shadow: 0 8px 24px rgba(26, 126, 168, 0.25);
}
.quote-text {
  margin: 0;
  font-family: Georgia, 'Noto Serif KR', serif;
  font-style: italic;
  font-size: 1.4rem;
  line-height: 1.5;
  letter-spacing: -0.2px;
  color: #ffffff;
}
.quote-next-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}
.quote-next-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.35);
}
.quote-next-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
