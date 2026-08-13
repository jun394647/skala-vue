<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const farmLocation = { name: '이천', query: 'Icheon-si,KR' }

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'

const weather = ref(null)
const forecast = ref([])
const air = ref(null)
const isLoading = ref(true)
const hasError = ref(false)

const crops = [
  {
    id: 'rice',
    name: '벼',
    icon: '🌾',
    rules: [
      { level: 'danger', test: (w) => Math.max(w.windSpeed, w.windGust) >= 10, text: '강풍으로 도복(쓰러짐) 위험이 높습니다. 배수로와 지지 상태를 점검하세요.' },
      { level: 'caution', test: (w) => w.humidity >= 85, text: '습도가 높아 도열병 등 병해 발생 우려가 있습니다.' },
      { level: 'caution', test: (w) => w.temp <= 15, text: '기온이 낮아 냉해 우려가 있습니다.' },
    ],
  },
  {
    id: 'leafy',
    name: '배추·무',
    icon: '🥬',
    rules: [
      { level: 'danger', test: (w) => w.temp <= 0, text: '서리 피해 위험이 있습니다. 부직포로 덮어주세요.' },
      { level: 'caution', test: (w) => w.temp >= 30, text: '고온으로 무름병·추대 우려가 있습니다. 오전·저녁에 관수하세요.' },
    ],
  },
  {
    id: 'orchard',
    name: '사과·배',
    icon: '🍎',
    rules: [
      { level: 'danger', test: (w) => w.temp <= 2, text: '개화기 서리 피해 위험이 매우 높습니다. 방상팬 가동을 준비하세요.' },
      { level: 'caution', test: (w) => Math.max(w.windSpeed, w.windGust) >= 9, text: '강풍으로 낙과 위험이 있습니다.' },
    ],
  },
  {
    id: 'pepper',
    name: '고추',
    icon: '🌶️',
    rules: [
      { level: 'danger', test: (w) => w.humidity >= 85, text: '역병·탄저병 확산 위험이 높습니다. 배수와 통풍을 확인하세요.' },
      { level: 'caution', test: (w) => w.temp >= 33, text: '고온으로 착과 불량이 우려됩니다.' },
      { level: 'caution', test: (w) => w.rainChance >= 60, text: '비 예보가 있어 방제(농약 살포) 작업은 미루는 게 좋습니다.' },
    ],
  },
  {
    id: 'root',
    name: '감자·고구마',
    icon: '🥔',
    rules: [
      { level: 'danger', test: (w) => w.temp <= 0, text: '서리로 지상부가 얼어 죽을 수 있습니다.' },
      { level: 'caution', test: (w) => w.humidity >= 85, text: '역병 발생 우려가 있습니다.' },
    ],
  },
  {
    id: 'persimmon',
    name: '감(곶감)',
    icon: '🟠',
    rules: [
      { level: 'danger', test: (w) => Math.max(w.windSpeed, w.windGust) >= 9, text: '강풍으로 낙과·건조 중인 곶감 손상 위험이 있습니다.' },
      { level: 'caution', test: (w) => w.humidity >= 80, text: '습도가 높아 곶감 건조가 더뎌지고 곰팡이 우려가 있습니다.' },
    ],
  },
]

const levelWeight = { danger: 2, caution: 1, safe: 0 }

const cropStatus = computed(() => {
  if (!weather.value) return []
  return crops
    .map((crop) => {
      const triggered = crop.rules.filter((rule) => rule.test(weather.value))
      const level = triggered.some((t) => t.level === 'danger') ? 'danger' : triggered.length ? 'caution' : 'safe'
      const messages = triggered.length ? triggered.map((t) => t.text) : ['오늘 날씨에서는 특별한 위험 요인이 없습니다.']
      return { ...crop, level, messages }
    })
    .sort((a, b) => levelWeight[b.level] - levelWeight[a.level])
})

const levelLabel = { danger: '위험', caution: '주의', safe: '안전' }

const daylightHours = computed(() => {
  if (!weather.value) return 0
  return (weather.value.sunset - weather.value.sunrise) / 3600
})

const estimatedSunlightHours = computed(() => {
  if (!weather.value) return 0
  const cloudFactor = 1 - (weather.value.clouds / 100) * 0.7
  return Math.round(daylightHours.value * cloudFactor * 10) / 10
})

const sunlightRatio = computed(() => {
  if (daylightHours.value === 0) return 0
  return Math.min(100, Math.round((estimatedSunlightHours.value / daylightHours.value) * 100))
})

const airLevel = { 1: '좋음', 2: '양호', 3: '보통', 4: '나쁨', 5: '매우나쁨' }

const weatherEmoji = (iconCode) => {
  const prefix = iconCode?.slice(0, 2)
  const map = {
    '01': '☀️',
    '02': '🌤️',
    '03': '☁️',
    '04': '☁️',
    '09': '🌧️',
    10: '🌦️',
    11: '⛈️',
    13: '❄️',
    50: '🌫️',
  }
  return map[prefix] ?? '🌡️'
}

const formatHour = (unixSeconds) => {
  const hour = new Date(unixSeconds * 1000).getHours()
  return `${hour}시`
}

const fetchWeather = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(`${WEATHER_URL}?q=${farmLocation.query}&appid=${API_KEY}&units=metric&lang=kr`),
      axios.get(`${FORECAST_URL}?q=${farmLocation.query}&appid=${API_KEY}&units=metric&lang=kr&cnt=6`),
    ])

    const data = weatherRes.data
    const rainChance = Math.max(0, ...forecastRes.data.list.map((entry) => Math.round((entry.pop ?? 0) * 100)))

    weather.value = {
      temp: Math.round(data.main.temp * 10) / 10,
      feelsLike: Math.round(data.main.feels_like * 10) / 10,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windGust: data.wind.gust ?? data.wind.speed,
      rainVolume: data.rain?.['1h'] ?? 0,
      clouds: data.clouds.all,
      status: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      rainChance,
    }
    forecast.value = forecastRes.data.list.map((entry) => ({
      time: formatHour(entry.dt),
      temp: Math.round(entry.main.temp),
      icon: entry.weather[0].icon,
      pop: Math.round((entry.pop ?? 0) * 100),
    }))

    try {
      const airRes = await axios.get(`${AIR_URL}?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`)
      air.value = airRes.data.list[0].main.aqi
    } catch (airError) {
      console.error('대기질 데이터를 불러오지 못했습니다:', airError)
      air.value = null
    }
  } catch (error) {
    console.error('농사 날씨 데이터를 불러오지 못했습니다:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchWeather)
</script>

<template>
  <div class="farm-app">
    <div class="farm-shell">
      <header class="farm-header">
        <h1>🌾 오늘의 농가 날씨</h1>
        <p class="subtitle">{{ farmLocation.name }} · 품목별 위험을 한눈에 확인하세요</p>
      </header>

      <p v-if="isLoading" class="status-text">날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="hasError" class="status-text error">날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>

      <template v-else-if="weather">
        <section class="hero-card">
          <div class="hero-watermark">{{ weatherEmoji(weather.icon) }}</div>
          <div class="hero-region">{{ farmLocation.name }} 현재 날씨</div>
          <div class="hero-temp">{{ weather.temp }}<span class="hero-unit">°C</span></div>
          <div class="hero-status">{{ weather.status }}</div>
          <div class="hero-feels">체감 온도 {{ weather.feelsLike }}°C</div>
          <div v-if="weather.rainVolume > 0" class="hero-rain">☔ 지금 1시간 강수량 {{ weather.rainVolume }}mm</div>
        </section>

        <section class="forecast-strip">
          <div class="forecast-title">앞으로 몇 시간 예보</div>
          <div class="forecast-row">
            <div v-for="(slot, index) in forecast" :key="index" class="forecast-slot">
              <div class="forecast-time">{{ slot.time }}</div>
              <div class="forecast-icon">{{ weatherEmoji(slot.icon) }}</div>
              <div class="forecast-temp">{{ slot.temp }}°</div>
              <div class="forecast-pop">☔ {{ slot.pop }}%</div>
            </div>
          </div>
        </section>

        <section class="crop-section">
          <div class="crop-section-title">품목별 위험 안내</div>
          <div class="crop-list">
            <div v-for="crop in cropStatus" :key="crop.id" class="crop-card" :class="crop.level">
              <div class="crop-card-head">
                <span class="crop-icon">{{ crop.icon }}</span>
                <span class="crop-name">{{ crop.name }}</span>
                <span class="crop-badge" :class="crop.level">{{ levelLabel[crop.level] }}</span>
              </div>
              <ul class="crop-messages">
                <li v-for="(msg, index) in crop.messages" :key="index">{{ msg }}</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="info-grid">
          <div class="info-tile">
            <div class="info-icon humidity">💧</div>
            <div class="info-label">습도</div>
            <div class="info-value">{{ weather.humidity }}%</div>
          </div>
          <div class="info-tile">
            <div class="info-icon wind">🌬️</div>
            <div class="info-label">바람 (돌풍)</div>
            <div class="info-value">{{ weather.windSpeed }}<span class="info-sub">/{{ weather.windGust }}m/s</span></div>
          </div>
          <div class="info-tile">
            <div class="info-icon sun">☀️</div>
            <div class="info-label">예상 일조시간</div>
            <div class="info-value">{{ estimatedSunlightHours }}시간</div>
          </div>
          <div class="info-tile">
            <div class="info-icon air">🌫️</div>
            <div class="info-label">대기질</div>
            <div class="info-value">{{ air ? airLevel[air] : '정보없음' }}</div>
          </div>
        </section>

        <section class="sunlight-section">
          <div class="sunlight-label">오늘 예상 일조시간 {{ estimatedSunlightHours }}시간 / 낮 길이 {{ Math.round(daylightHours * 10) / 10 }}시간</div>
          <div class="sunlight-track">
            <div class="sunlight-fill" :style="{ width: sunlightRatio + '%' }"></div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.farm-app {
  min-height: 100vh;
  padding: 32px 16px 60px;
  background: radial-gradient(circle at 20% 0%, #1b2b45 0%, #0c1526 55%, #08101c 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  color: #f3f6fa;
}

.farm-shell {
  max-width: 640px;
  margin: 0 auto;
}

.farm-header {
  text-align: center;
  margin-bottom: 24px;
}

.farm-header h1 {
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0 0 6px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1.05rem;
  color: #a8b6cc;
  margin: 0;
}

.status-text {
  text-align: center;
  font-size: 1.2rem;
  color: #a8b6cc;
  padding: 40px 0;
}

.status-text.error {
  color: #ff8a80;
}

.hero-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  margin-bottom: 20px;
}

.hero-watermark {
  position: absolute;
  right: -10px;
  top: -20px;
  font-size: 8rem;
  opacity: 0.12;
  filter: blur(0.5px);
}

.hero-region {
  font-size: 1rem;
  color: #93a2ba;
  font-weight: 600;
  margin-bottom: 12px;
}

.hero-temp {
  font-size: 5rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.hero-unit {
  font-size: 2rem;
  font-weight: 700;
  color: #f3a712;
  margin-left: 4px;
}

.hero-status {
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 10px;
  color: #e4ecfa;
}

.hero-feels {
  font-size: 1.05rem;
  color: #93a2ba;
  margin-top: 6px;
}

.hero-rain {
  display: inline-block;
  margin-top: 14px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(58, 130, 214, 0.2);
  color: #9cc4f5;
  font-size: 0.95rem;
  font-weight: 700;
}

.forecast-strip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 18px 16px;
  margin-bottom: 20px;
}

.forecast-title {
  font-size: 1rem;
  font-weight: 700;
  color: #a8b6cc;
  margin-bottom: 12px;
}

.forecast-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.forecast-slot {
  flex: 0 0 auto;
  min-width: 68px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 12px 8px;
}

.forecast-time {
  font-size: 0.85rem;
  color: #93a2ba;
  margin-bottom: 6px;
}

.forecast-icon {
  font-size: 1.6rem;
  margin-bottom: 6px;
}

.forecast-temp {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f3f6fa;
}

.forecast-pop {
  font-size: 0.8rem;
  color: #7fb6f5;
  margin-top: 4px;
}

.crop-section {
  margin-bottom: 20px;
}

.crop-section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
}

.crop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crop-card {
  border-radius: 18px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 5px solid rgba(255, 255, 255, 0.2);
}

.crop-card.danger {
  border-left-color: #ff6b5f;
  background: rgba(214, 69, 58, 0.1);
}

.crop-card.caution {
  border-left-color: #f3a712;
  background: rgba(243, 167, 18, 0.08);
}

.crop-card.safe {
  border-left-color: #2ea05b;
  background: rgba(46, 160, 91, 0.06);
}

.crop-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.crop-icon {
  font-size: 1.5rem;
}

.crop-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f3f6fa;
  flex: 1;
}

.crop-badge {
  font-size: 0.9rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
}

.crop-badge.danger {
  background: #ff6b5f;
  color: #2a0805;
}

.crop-badge.caution {
  background: #f3a712;
  color: #2a1c02;
}

.crop-badge.safe {
  background: #2ea05b;
  color: #06210f;
}

.crop-messages {
  margin: 0;
  padding-left: 20px;
  color: #cdd8ea;
  font-size: 1rem;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-tile {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 18px 8px;
  text-align: center;
}

.info-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.4rem;
}

.info-icon.humidity {
  background: rgba(58, 130, 214, 0.22);
}

.info-icon.wind {
  background: rgba(148, 163, 184, 0.22);
}

.info-icon.sun {
  background: rgba(243, 167, 18, 0.22);
}

.info-icon.air {
  background: rgba(148, 197, 184, 0.22);
}

.info-label {
  font-size: 0.95rem;
  color: #93a2ba;
  margin-bottom: 4px;
}

.info-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f3f6fa;
}

.info-sub {
  font-size: 0.95rem;
  font-weight: 600;
  color: #93a2ba;
}

.sunlight-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 18px 20px;
}

.sunlight-label {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #dbe4f2;
}

.sunlight-track {
  height: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.sunlight-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f3a712, #ffd166);
  box-shadow: 0 0 12px rgba(243, 167, 18, 0.6);
  transition: width 0.4s ease;
}
</style>
