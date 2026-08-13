<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import CropSettings from './components/farm/CropSettings.vue'

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

const BIG_TEXT_KEY = 'farm-big-text'
const bigText = ref(localStorage.getItem(BIG_TEXT_KEY) === '1')

const toggleBigText = () => {
  bigText.value = !bigText.value
  localStorage.setItem(BIG_TEXT_KEY, bigText.value ? '1' : '0')
}

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

const showSettings = ref(false)
const selectedCropIds = ref(crops.map((crop) => crop.id))
const visibleCropStatus = computed(() => cropStatus.value.filter((crop) => selectedCropIds.value.includes(crop.id)))

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

const statusAliases = {
  온흐림: '흐림',
  튼구름: '구름 많음',
  '실 비': '가는 비',
  박무: '옅은 안개',
  연무: '안개',
}

const friendlyStatus = (status) => statusAliases[status] ?? status

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

const illustrationType = computed(() => {
  const prefix = weather.value?.icon?.slice(0, 2)
  if (prefix === '01') return 'sun'
  if (prefix === '13') return 'snow'
  if (prefix === '09' || prefix === '10' || prefix === '11') return 'rain'
  return 'cloud'
})

const heroGlow = computed(() => {
  if (!weather.value) return '#1b2b45'
  const t = weather.value.temp
  if (t <= 5) return '#173a58'
  if (t <= 15) return '#1b3a4a'
  if (t <= 25) return '#1b2b45'
  if (t <= 32) return '#3a2f1f'
  return '#4a2415'
})

const pageBackground = computed(() => `radial-gradient(circle at 20% 0%, ${heroGlow.value} 0%, #0c1526 55%, #08101c 100%)`)

const startOfDay = (date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

const dayDiffPrefix = (dayDiff) => {
  if (dayDiff <= 0) return ''
  if (dayDiff === 1) return '내일 '
  return `${dayDiff}일 후 `
}

const dayDiffLabel = (dayDiff) => {
  if (dayDiff === 1) return '내일'
  return `${dayDiff}일 후`
}

const formatClock = (unixSeconds) => new Date(unixSeconds * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })

const bestWorkWindow = computed(() => {
  const todaySlots = forecast.value.filter((slot) => slot.dayDiff === 0)
  const candidates = todaySlots.filter((slot) => slot.pop < 30 && slot.temp >= 5 && slot.temp <= 32)
  if (!candidates.length) return null
  const best = candidates.reduce((a, b) => (b.pop < a.pop ? b : a))
  return `${best.hour}시 ~ ${(best.hour + 3) % 24}시`
})

const frostWarning = computed(() => {
  const upcoming = forecast.value.filter((slot) => slot.dayDiff <= 1)
  if (!upcoming.length) return null
  const coldest = upcoming.reduce((min, slot) => (slot.temp < min.temp ? slot : min), upcoming[0])
  if (coldest.temp > 3) return null
  return `${dayDiffPrefix(coldest.dayDiff)}${coldest.hour}시경 최저기온이 ${coldest.temp}°C까지 떨어질 것으로 예상됩니다. 서리 대비가 필요합니다.`
})

const fetchWeather = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(`${WEATHER_URL}?q=${farmLocation.query}&appid=${API_KEY}&units=metric&lang=kr`),
      axios.get(`${FORECAST_URL}?q=${farmLocation.query}&appid=${API_KEY}&units=metric&lang=kr&cnt=16`),
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
    const todayStart = startOfDay(new Date())
    const rawSlots = forecastRes.data.list.map((entry) => {
      const date = new Date(entry.dt * 1000)
      return {
        hour: date.getHours(),
        dayDiff: Math.round((startOfDay(date) - todayStart) / 86400000),
        temp: Math.round(entry.main.temp),
        icon: entry.weather[0].icon,
        pop: Math.round((entry.pop ?? 0) * 100),
      }
    })
    forecast.value = rawSlots.map((slot, index) => ({
      time: `${dayDiffPrefix(slot.dayDiff)}${slot.hour}시`,
      temp: slot.temp,
      icon: slot.icon,
      pop: slot.pop,
      hour: slot.hour,
      dayDiff: slot.dayDiff,
      isNewDay: index > 0 && slot.dayDiff !== rawSlots[index - 1].dayDiff,
      dayLabel: slot.dayDiff > 0 ? dayDiffLabel(slot.dayDiff) : '',
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
  <div class="farm-app" :class="{ 'big-text': bigText }" :style="{ background: pageBackground }">
    <div class="farm-shell">
      <div class="accessibility-bar">
        <button
          type="button"
          class="big-text-toggle"
          :aria-pressed="bigText"
          @click="toggleBigText"
        >
          {{ bigText ? '글씨 작게' : '글씨 크게' }}
        </button>
      </div>

      <header class="farm-header">
        <h1>🌾 오늘의 농가 날씨</h1>
        <p class="subtitle">{{ farmLocation.name }} · 품목별 위험을 한눈에 확인하세요</p>
      </header>

      <div class="settings-bar">
        <button class="settings-button" @click="showSettings = true">⚙️ 품목 설정</button>
      </div>
      <CropSettings :crops="crops" v-model:selected="selectedCropIds" :open="showSettings" @close="showSettings = false" />

      <p v-if="isLoading" class="status-text" role="status" aria-live="polite">날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="hasError" class="status-text error" role="alert" aria-live="polite">날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>

      <template v-else-if="weather">
        <div v-if="frostWarning" class="frost-alert" role="alert">
          <span aria-hidden="true">❄️</span> {{ frostWarning }}
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-main">
            <section class="hero-card">
              <div class="hero-illustration" aria-hidden="true">
                <svg v-if="illustrationType === 'sun'" viewBox="0 0 120 120" class="illust illust-sun">
                  <g class="sun-rays">
                    <line v-for="n in 8" :key="n" x1="60" y1="6" x2="60" y2="20" :transform="`rotate(${n * 45} 60 60)`" />
                  </g>
                  <circle cx="60" cy="60" r="26" class="sun-core" />
                </svg>
                <svg v-else-if="illustrationType === 'cloud'" viewBox="0 0 140 100" class="illust illust-cloud">
                  <ellipse cx="55" cy="55" rx="40" ry="24" class="cloud-back" />
                  <ellipse cx="85" cy="50" rx="32" ry="20" class="cloud-front" />
                </svg>
                <svg v-else-if="illustrationType === 'rain'" viewBox="0 0 140 110" class="illust illust-rain">
                  <ellipse cx="55" cy="45" rx="40" ry="24" class="cloud-back" />
                  <ellipse cx="85" cy="40" rx="32" ry="20" class="cloud-front" />
                  <line v-for="n in 3" :key="n" :x1="45 + n * 18" y1="78" :x2="40 + n * 18" y2="96" class="rain-drop" :style="{ animationDelay: `${n * 0.2}s` }" />
                </svg>
                <svg v-else viewBox="0 0 140 110" class="illust illust-snow">
                  <ellipse cx="55" cy="45" rx="40" ry="24" class="cloud-back" />
                  <ellipse cx="85" cy="40" rx="32" ry="20" class="cloud-front" />
                  <circle v-for="n in 3" :key="n" :cx="45 + n * 18" cy="90" r="3" class="snow-flake" :style="{ animationDelay: `${n * 0.3}s` }" />
                </svg>
              </div>
              <div class="hero-region">{{ farmLocation.name }} 현재 날씨</div>
              <div class="hero-temp">{{ weather.temp }}<span class="hero-unit">°C</span></div>
              <div class="hero-status">{{ friendlyStatus(weather.status) }}</div>
              <div class="hero-feels">체감 온도 {{ weather.feelsLike }}°C</div>
              <div v-if="weather.rainVolume > 0" class="hero-rain">☔ 지금 1시간 강수량 {{ weather.rainVolume }}mm</div>
            </section>

            <section class="crop-section">
              <div class="crop-section-title">품목별 위험 안내</div>
              <div class="crop-list">
                <div v-for="crop in visibleCropStatus" :key="crop.id" class="crop-card" :class="crop.level">
                  <div class="crop-card-head">
                    <span class="crop-icon" aria-hidden="true">{{ crop.icon }}</span>
                    <span class="crop-name">{{ crop.name }}</span>
                    <span class="crop-badge" :class="crop.level" :aria-label="`${crop.name}, ${levelLabel[crop.level]} 등급`">{{ levelLabel[crop.level] }}</span>
                  </div>
                  <ul class="crop-messages">
                    <li v-for="(msg, index) in crop.messages" :key="index">{{ msg }}</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div class="dashboard-side">
            <section class="tips-section">
              <div class="tips-title">🌅 오늘의 참고 정보</div>
              <div class="tips-row">
                <span>일출</span>
                <strong>{{ formatClock(weather.sunrise) }}</strong>
              </div>
              <div class="tips-row">
                <span>일몰</span>
                <strong>{{ formatClock(weather.sunset) }}</strong>
              </div>
              <div v-if="bestWorkWindow" class="tips-row">
                <span>추천 작업 시간</span>
                <strong>{{ bestWorkWindow }}</strong>
              </div>
              <p v-else class="tips-empty">오늘은 강수 확률이 낮은 시간대가 마땅치 않습니다.</p>
            </section>

            <section class="forecast-strip">
              <div class="forecast-title">오늘 · 내일 시간별 예보</div>
              <div class="forecast-row">
                <template v-for="(slot, index) in forecast" :key="index">
                  <div v-if="slot.isNewDay" class="forecast-divider">
                    <span class="forecast-divider-label">{{ slot.dayLabel }}</span>
                  </div>
                  <div class="forecast-slot">
                    <div class="forecast-time">{{ slot.time }}</div>
                    <div class="forecast-icon">{{ weatherEmoji(slot.icon) }}</div>
                    <div class="forecast-temp">{{ slot.temp }}°</div>
                    <div class="forecast-pop">☔ {{ slot.pop }}%</div>
                  </div>
                </template>
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
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.farm-app {
  --font-scale: 1;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  padding: 24px clamp(16px, 4vw, 56px) 60px;
  background: radial-gradient(circle at 20% 0%, #1b2b45 0%, #0c1526 55%, #08101c 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  color: #f3f6fa;
}

.farm-app.big-text {
  --font-scale: 1.3;
}

.farm-shell {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.dashboard-main,
.dashboard-side {
  min-width: 0;
}

@media (min-width: 900px) {
  .dashboard-grid {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  }

  .crop-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1300px) {
  .crop-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.frost-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  padding: 18px 20px;
  margin-bottom: 20px;
  background: rgba(58, 130, 214, 0.18);
  border: 1px solid rgba(124, 180, 245, 0.4);
  color: #cfe4fc;
  font-size: calc(1.1rem * var(--font-scale, 1));
  font-weight: 700;
}

.accessibility-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.big-text-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  min-width: 44px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(243, 167, 18, 0.5);
  background: rgba(243, 167, 18, 0.12);
  color: #f3d9a0;
  font-size: calc(1rem * var(--font-scale, 1));
  font-weight: 700;
  cursor: pointer;
}

.big-text-toggle[aria-pressed='true'] {
  background: #f3a712;
  border-color: #f3a712;
  color: #2a1c02;
}

.farm-header {
  text-align: center;
  margin-bottom: 24px;
}

.farm-header h1 {
  font-size: calc(2.1rem * var(--font-scale, 1));
  font-weight: 800;
  margin: 0 0 6px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: calc(1.05rem * var(--font-scale, 1));
  color: #a8b6cc;
  margin: 0;
}

.settings-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.settings-button {
  font-size: calc(1.05rem * var(--font-scale, 1));
  font-weight: 700;
  padding: 12px 22px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.07);
  color: #f3f6fa;
  cursor: pointer;
}

.status-text {
  text-align: center;
  font-size: calc(1.2rem * var(--font-scale, 1));
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

.hero-illustration {
  position: absolute;
  right: -10px;
  top: -10px;
  width: 150px;
  opacity: 0.5;
}

.illust {
  width: 100%;
  height: auto;
}

.sun-core {
  fill: #f3a712;
}

.sun-rays line {
  stroke: #f3a712;
  stroke-width: 4;
  stroke-linecap: round;
  transform-origin: 60px 60px;
  animation: sun-spin 24s linear infinite;
}

@keyframes sun-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.illust-sun {
  animation: sun-pulse 6s ease-in-out infinite;
}

@keyframes sun-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.cloud-back {
  fill: rgba(255, 255, 255, 0.55);
}

.cloud-front {
  fill: rgba(255, 255, 255, 0.85);
}

.illust-cloud .cloud-front,
.illust-rain .cloud-front,
.illust-snow .cloud-front {
  animation: cloud-drift 8s ease-in-out infinite;
}

@keyframes cloud-drift {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(6px);
  }
}

.rain-drop {
  stroke: #7fb6f5;
  stroke-width: 3;
  stroke-linecap: round;
  animation: rain-fall 1s linear infinite;
}

@keyframes rain-fall {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(10px);
  }
}

.snow-flake {
  fill: #f3f6fa;
  animation: snow-fall 2.4s ease-in-out infinite;
}

@keyframes snow-fall {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sun-rays line,
  .illust-sun,
  .cloud-front,
  .rain-drop,
  .snow-flake {
    animation: none;
  }
}

.hero-region {
  font-size: calc(1rem * var(--font-scale, 1));
  color: #93a2ba;
  font-weight: 600;
  margin-bottom: 12px;
}

.hero-temp {
  font-size: calc(5rem * var(--font-scale, 1));
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.hero-unit {
  font-size: calc(2rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3a712;
  margin-left: 4px;
}

.hero-status {
  font-size: calc(1.4rem * var(--font-scale, 1));
  font-weight: 600;
  margin-top: 10px;
  color: #e4ecfa;
}

.hero-feels {
  font-size: calc(1.05rem * var(--font-scale, 1));
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
  font-size: calc(0.95rem * var(--font-scale, 1));
  font-weight: 700;
}

.tips-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.tips-title {
  font-size: calc(1.05rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3d9a0;
  margin-bottom: 12px;
}

.tips-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: calc(1.05rem * var(--font-scale, 1));
  color: #dbe4f2;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tips-row:first-of-type {
  border-top: none;
}

.tips-row strong {
  color: #ffffff;
  font-weight: 800;
}

.tips-empty {
  font-size: calc(0.95rem * var(--font-scale, 1));
  color: #93a2ba;
  margin: 8px 0 0;
}

.forecast-strip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 18px 16px;
  margin-bottom: 20px;
}

.forecast-title {
  font-size: calc(1rem * var(--font-scale, 1));
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

.forecast-divider {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px;
}

.forecast-divider::before {
  content: '';
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.18);
}

.forecast-divider-label {
  writing-mode: vertical-rl;
  font-size: calc(0.8rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3a712;
}

.forecast-time {
  font-size: calc(0.85rem * var(--font-scale, 1));
  color: #93a2ba;
  margin-bottom: 6px;
}

.forecast-icon {
  font-size: calc(1.6rem * var(--font-scale, 1));
  margin-bottom: 6px;
}

.forecast-temp {
  font-size: calc(1.05rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3f6fa;
}

.forecast-pop {
  font-size: calc(0.8rem * var(--font-scale, 1));
  color: #7fb6f5;
  margin-top: 4px;
}

.crop-section {
  margin-bottom: 20px;
}

.crop-section-title {
  font-size: calc(1.15rem * var(--font-scale, 1));
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
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.crop-icon {
  font-size: calc(1.5rem * var(--font-scale, 1));
}

.crop-name {
  font-size: calc(1.15rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3f6fa;
  flex: 1;
  min-width: 80px;
  overflow-wrap: break-word;
}

.crop-badge {
  font-size: calc(0.9rem * var(--font-scale, 1));
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
  font-size: calc(1rem * var(--font-scale, 1));
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
  font-size: calc(1.4rem * var(--font-scale, 1));
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
  font-size: calc(0.95rem * var(--font-scale, 1));
  color: #93a2ba;
  margin-bottom: 4px;
}

.info-value {
  font-size: calc(1.3rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3f6fa;
}

.info-sub {
  font-size: calc(0.95rem * var(--font-scale, 1));
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
  font-size: calc(1.05rem * var(--font-scale, 1));
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
