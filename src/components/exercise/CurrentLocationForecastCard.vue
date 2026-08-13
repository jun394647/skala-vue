<script setup>
// 가이드 범위를 넘어선 추가 기능 — 현재 위치 날씨 + 3시간 이내 단기예보로 러닝 타이밍 안내
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { friendlyStatus } from '../../utils/weatherText'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

const locationName = ref('')
const current = ref(null)
const next = ref(null)
const status = ref('idle')

const pickRunningTip = (c, n) => {
  const nextIsRain = n.pop >= 0.4
  const currentIsRain = c.rainVolume > 0
  if (nextIsRain && !currentIsRain) {
    return '🌧️ 3시간 안에 비 올 가능성이 높아요. 지금 나가는 걸 추천해요.'
  }
  if (currentIsRain && !nextIsRain) {
    return '☔ 지금은 비가 와요. 3시간 후엔 갤 것 같으니 조금 기다렸다 나가보세요.'
  }
  if (n.temp - c.temp >= 5) {
    return '🌡️ 기온이 오르고 있어요. 더워지기 전에 지금 나가는 게 좋아요.'
  }
  if (c.temp - n.temp >= 5) {
    return '🧥 기온이 떨어지고 있어요. 3시간 후엔 겉옷을 챙기세요.'
  }
  return '👍 지금이나 3시간 후나 러닝하기엔 큰 차이 없어요.'
}

const fetchLocationForecast = () => {
  if (!navigator.geolocation) {
    status.value = 'unsupported'
    return
  }
  status.value = 'loading'
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const params = { lat: latitude, lon: longitude, appid: API_KEY, units: 'metric', lang: 'kr' }
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(WEATHER_URL, { params }),
          axios.get(FORECAST_URL, { params: { ...params, cnt: 1 } }),
        ])

        locationName.value = weatherRes.data.name
        current.value = {
          temp: Math.round(weatherRes.data.main.temp),
          status: weatherRes.data.weather[0].description,
          rainVolume: weatherRes.data.rain?.['1h'] ?? weatherRes.data.rain?.['3h'] ?? 0,
        }

        const forecastItem = forecastRes.data.list[0]
        next.value = {
          temp: Math.round(forecastItem.main.temp),
          status: forecastItem.weather[0].description,
          pop: forecastItem.pop ?? 0,
          time: new Date(forecastItem.dt * 1000).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }

        status.value = 'ready'
      } catch (error) {
        console.error('🔴 현재 위치 단기예보 조회 실패:', error)
        status.value = 'error'
      }
    },
    () => {
      status.value = 'denied'
    },
  )
}

onMounted(fetchLocationForecast)
</script>

<template>
  <el-card class="forecast-card" shadow="hover">
    <template #header>📍 현재 위치 날씨 &amp; 3시간 단기예보</template>

    <p v-if="status === 'loading'">현재 위치를 확인하는 중입니다...</p>
    <p v-else-if="status === 'denied'">위치 권한을 허용하면 현재 위치 기준 단기예보를 보여드려요.</p>
    <p v-else-if="status === 'unsupported' || status === 'error'">현재 위치 예보를 사용할 수 없습니다.</p>
    <template v-else-if="status === 'ready'">
      <p class="forecast-location">
        {{ locationName }} · 지금 {{ current.temp }}°C · {{ friendlyStatus(current.status) }}
      </p>
      <p class="forecast-next">
        {{ next.time }} 예보 · {{ next.temp }}°C · {{ friendlyStatus(next.status) }} · 강수확률
        {{ Math.round(next.pop * 100) }}%
      </p>
      <p class="forecast-tip">{{ pickRunningTip(current, next) }}</p>
    </template>

    <el-button size="small" @click="fetchLocationForecast">다시 확인</el-button>
  </el-card>
</template>

<style scoped>
.forecast-card {
  margin-bottom: 15px;
  --el-card-bg-color: var(--ex-card-bg, #fff);
  color: var(--ex-text, #2c3e50);
}
.forecast-location {
  font-weight: bold;
  margin-bottom: 6px;
  color: var(--ex-text, #2c3e50);
}
.forecast-next {
  color: var(--ex-text-soft, #7f8c8d);
  margin-bottom: 6px;
}
.forecast-tip {
  font-size: var(--ex-font-sm, 0.875rem);
  margin-bottom: 12px;
}
</style>
