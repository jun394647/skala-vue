<script setup>
// 가이드 범위를 넘어선 추가 기능 — 브라우저 위치 정보 + OpenWeatherMap으로 현재 위치 날씨 기반 코스 추천
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { friendlyStatus } from '../../utils/weatherText'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

const locationName = ref('')
const weather = ref(null)
const routeAdvice = ref(null)
const status = ref('idle')

const pickRoute = (w) => {
  if (w.rain) {
    return { distance: '실내 3km 대체 추천', tip: '비가 오고 있어요. 러닝머신이나 실내 운동을 추천해요.' }
  }
  if (w.temp >= 30) {
    return { distance: '3km 짧은 루프', tip: '더운 날씨예요. 그늘이 많은 짧은 코스로 가볍게 다녀오세요.' }
  }
  if (w.temp <= 3) {
    return { distance: '3km 짧은 루프', tip: '쌀쌀해요. 몸을 충분히 풀고 짧게 시작하세요.' }
  }
  if (w.windSpeed >= 8) {
    return { distance: '4km 순환 코스', tip: '바람이 강해요. 바람을 등지고 도는 순환 코스가 좋아요.' }
  }
  return { distance: '5km 순환 코스', tip: '러닝하기 좋은 날씨예요! 평소보다 조금 더 달려보세요.' }
}

const fetchLocationWeather = () => {
  if (!navigator.geolocation) {
    status.value = 'unsupported'
    return
  }
  status.value = 'loading'
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const response = await axios.get(WEATHER_URL, {
          params: { lat: latitude, lon: longitude, appid: API_KEY, units: 'metric', lang: 'kr' },
        })
        const data = response.data
        locationName.value = data.name
        weather.value = {
          temp: Math.round(data.main.temp),
          status: data.weather[0].description,
          windSpeed: data.wind.speed,
          rain: Boolean(data.rain),
        }
        routeAdvice.value = pickRoute(weather.value)
        status.value = 'ready'
      } catch (error) {
        console.error('🔴 위치 기반 날씨 조회 실패:', error)
        status.value = 'error'
      }
    },
    () => {
      status.value = 'denied'
    },
  )
}

onMounted(fetchLocationWeather)
</script>

<template>
  <el-card class="running-route-card" shadow="hover">
    <template #header>📍 내 주변 러닝 코스 추천</template>

    <p v-if="status === 'loading'">현재 위치를 확인하는 중입니다...</p>
    <p v-else-if="status === 'denied'">위치 권한을 허용하면 주변 날씨에 맞는 코스를 추천해드려요.</p>
    <p v-else-if="status === 'unsupported' || status === 'error'">위치 기반 추천을 사용할 수 없습니다.</p>
    <template v-else-if="status === 'ready'">
      <p class="route-location">{{ locationName }} · {{ weather.temp }}°C · {{ friendlyStatus(weather.status) }}</p>
      <p class="route-distance">{{ routeAdvice.distance }}</p>
      <p class="route-tip">{{ routeAdvice.tip }}</p>
    </template>

    <el-button size="small" @click="fetchLocationWeather">다시 확인</el-button>
  </el-card>
</template>

<style scoped>
.running-route-card {
  margin-bottom: 15px;
}
.route-location {
  font-weight: bold;
  margin-bottom: 6px;
  color: var(--ex-text, #2c3e50);
}
.route-distance {
  font-size: 1.2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 6px;
}
.route-tip {
  color: var(--ex-text-soft, #7f8c8d);
  margin-bottom: 12px;
}
</style>
