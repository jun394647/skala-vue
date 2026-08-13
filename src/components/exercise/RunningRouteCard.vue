<script setup>
// 가이드 범위를 넘어선 추가 기능 — 브라우저 위치 정보 + OpenWeatherMap으로 현재 위치 날씨 기반 코스 추천
// + 카카오맵으로 현재 위치 지도 표시
import { ref, computed, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { friendlyStatus } from '../../utils/weatherText'
import { clothingTip } from '../../utils/clothingTip'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const KAKAO_MAP_KEY = import.meta.env.VITE_MOVIE_API_KEY

const AVERAGE_WEIGHT_KG = 65
const CALORIES_PER_KG_PER_KM = 1.0

const locationName = ref('')
const weather = ref(null)
const routeAdvice = ref(null)
const status = ref('idle')
const mapContainer = ref(null)
const coords = ref(null)
const routeAscent = ref(null)
const actualDistanceKm = ref(null)

const caloriesEstimate = computed(() => {
  const distanceKm = actualDistanceKm.value ?? routeAdvice.value?.distanceKm
  if (!distanceKm) return null
  return Math.round(distanceKm * AVERAGE_WEIGHT_KG * CALORIES_PER_KG_PER_KM)
})

const formatHourMinute = (unixSeconds) =>
  new Date(unixSeconds * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

const kakaoMapLink = computed(() => {
  if (!coords.value) return ''
  return `https://map.kakao.com/link/map/러닝 코스,${coords.value.lat},${coords.value.lng}`
})

let kakaoSdkPromise = null
const loadKakaoMapSdk = () => {
  if (window.kakao?.maps) return Promise.resolve()
  if (!kakaoSdkPromise) {
    kakaoSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`
      script.onload = () => window.kakao.maps.load(resolve)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return kakaoSdkPromise
}

const EARTH_RADIUS_M = 6371000

const buildLoopPoints = (lat, lng, distanceKm) => {
  const radiusM = (distanceKm * 1000) / (2 * Math.PI)
  const steps = 32
  const points = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI
    const dx = radiusM * Math.sin(angle)
    const dy = radiusM * (1 - Math.cos(angle))
    const dLat = (dy / EARTH_RADIUS_M) * (180 / Math.PI)
    const dLng = (dx / (EARTH_RADIUS_M * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI)
    points.push({ lat: lat + dLat, lng: lng + dLng })
  }
  return points
}

const buildLoopWaypoints = (lat, lng, distanceKm, count = 6) => {
  const loop = buildLoopPoints(lat, lng, distanceKm)
  const step = Math.max(1, Math.floor((loop.length - 1) / count))
  const waypoints = []
  for (let i = 0; i < loop.length - 1; i += step) {
    waypoints.push(loop[i])
  }
  waypoints.push(loop[0])
  return waypoints
}

// ORS는 실도로 경로용 서버 프록시(api/route.js) — GitHub Pages엔 서버가 없어 404가 정상이며, 이 경우 합성 원형 코스로 조용히 폴백한다
const fetchRealRoutePath = async (lat, lng, distanceKm) => {
  const coordinates = buildLoopWaypoints(lat, lng, distanceKm).map((p) => [p.lng, p.lat])
  const response = await axios.post(
    '/api/route',
    { coordinates },
    { timeout: 8000 },
  )
  const path = response.data?.path
  if (!Array.isArray(path) || path.length < 2) {
    throw new Error('경로 데이터 없음')
  }
  return {
    path: path.map(([lng2, lat2]) => new window.kakao.maps.LatLng(lat2, lng2)),
    ascent: response.data.ascent,
    distanceMeters: response.data.distanceMeters,
  }
}

const buildSyntheticLoopPath = (lat, lng, distanceKm) =>
  buildLoopPoints(lat, lng, distanceKm).map((p) => new window.kakao.maps.LatLng(p.lat, p.lng))

const renderMap = async (latitude, longitude, courseKm) => {
  routeAscent.value = null
  actualDistanceKm.value = null
  try {
    await loadKakaoMapSdk()
    await nextTick()
    if (!mapContainer.value) return
    const center = new window.kakao.maps.LatLng(latitude, longitude)
    const map = new window.kakao.maps.Map(mapContainer.value, { center, level: 4 })
    new window.kakao.maps.Marker({ position: center, map })

    if (courseKm) {
      let path
      try {
        const result = await fetchRealRoutePath(latitude, longitude, courseKm)
        path = result.path
        routeAscent.value = result.ascent ?? null
        actualDistanceKm.value = result.distanceMeters ? result.distanceMeters / 1000 : null
      } catch {
        path = buildSyntheticLoopPath(latitude, longitude, courseKm)
        routeAscent.value = null
        actualDistanceKm.value = null
      }
      new window.kakao.maps.Polyline({
        map,
        path,
        strokeWeight: 4,
        strokeColor: '#27ae60',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
      })
      const bounds = new window.kakao.maps.LatLngBounds()
      path.forEach((point) => bounds.extend(point))
      map.setBounds(bounds)
    }
  } catch (error) {
    console.error('🔴 카카오맵 로딩 실패:', error)
  }
}

const RAIN_INDOOR_THRESHOLD_MM = 2

const pickRoute = (w) => {
  if (w.rainVolume >= RAIN_INDOOR_THRESHOLD_MM) {
    return {
      distance: '실내 3km 대체 추천',
      distanceKm: null,
      tip: '비가 제법 와요. 러닝머신이나 실내 운동을 추천해요.',
    }
  }
  if (w.rainVolume > 0) {
    return {
      distance: '3km 짧은 루프',
      distanceKm: 3,
      tip: '가는 비가 내려요. 방수 재킷 챙기고 미끄럼 조심해서 가볍게 다녀오세요.',
    }
  }
  if (w.temp >= 30) {
    return {
      distance: '3km 짧은 루프',
      distanceKm: 3,
      tip: '더운 날씨예요. 그늘이 많은 짧은 코스로 가볍게 다녀오세요.',
    }
  }
  if (w.temp <= 3) {
    return {
      distance: '3km 짧은 루프',
      distanceKm: 3,
      tip: '쌀쌀해요. 몸을 충분히 풀고 짧게 시작하세요.',
    }
  }
  if (w.windSpeed >= 8) {
    return {
      distance: '4km 순환 코스',
      distanceKm: 4,
      tip: '바람이 강해요. 바람을 등지고 도는 순환 코스가 좋아요.',
    }
  }
  return {
    distance: '5km 순환 코스',
    distanceKm: 5,
    tip: '러닝하기 좋은 날씨예요! 평소보다 조금 더 달려보세요.',
  }
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
        coords.value = { lat: latitude, lng: longitude }
        locationName.value = data.name
        weather.value = {
          temp: Math.round(data.main.temp),
          status: data.weather[0].description,
          windSpeed: data.wind.speed,
          rainVolume: data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0,
          sunrise: formatHourMinute(data.sys.sunrise),
          sunset: formatHourMinute(data.sys.sunset),
        }
        routeAdvice.value = pickRoute(weather.value)
        status.value = 'ready'
        renderMap(latitude, longitude, routeAdvice.value.distanceKm)
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
      <div ref="mapContainer" class="route-map"></div>
      <p class="route-location">
        {{ locationName }} · {{ weather.temp }}°C · {{ friendlyStatus(weather.status) }} ·
        <strong>{{ routeAdvice.distance }}</strong>
        <span v-if="actualDistanceKm">(실제 약 {{ actualDistanceKm.toFixed(1) }}km)</span>
      </p>
      <p class="route-tip">{{ routeAdvice.tip }} {{ clothingTip(weather.temp) }}</p>

      <div class="route-stats-grid">
        <div class="route-stat">
          <span class="stat-icon">🌅</span>
          <span class="stat-value">{{ weather.sunrise }}</span>
        </div>
        <div class="route-stat">
          <span class="stat-icon">🌇</span>
          <span class="stat-value">{{ weather.sunset }}</span>
        </div>
        <div class="route-stat">
          <span class="stat-icon">⛰️</span>
          <span class="stat-value">{{ routeAscent !== null ? `${Math.round(routeAscent)}m` : '-' }}</span>
        </div>
        <div class="route-stat">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">{{ caloriesEstimate !== null ? `${caloriesEstimate}kcal` : '-' }}</span>
        </div>
      </div>

      <a v-if="kakaoMapLink" :href="kakaoMapLink" target="_blank" rel="noopener" class="route-map-link">
        카카오맵 앱에서 보기 ↗
      </a>
    </template>

    <el-button size="small" @click="fetchLocationWeather">다시 확인</el-button>
  </el-card>
</template>

<style scoped>
.running-route-card {
  margin-bottom: 10px;
  --el-card-bg-color: var(--ex-card-bg, #fff);
  --el-card-padding: 12px;
  color: var(--ex-text, #2c3e50);
}
.route-map {
  width: 100%;
  height: 130px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--ex-input-bg, #f1f2f6);
}
.route-location {
  font-size: var(--ex-font-sm, 0.875rem);
  margin-bottom: 4px;
  color: var(--ex-text, #2c3e50);
}
.route-location strong {
  color: #27ae60;
}
.route-tip {
  font-size: var(--ex-font-xs, 0.75rem);
  color: var(--ex-text-soft, #7f8c8d);
  margin-bottom: 8px;
}
.route-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}
.route-stat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--ex-input-bg, #f1f2f6);
  border-radius: 6px;
  padding: 6px 4px;
}
.stat-icon {
  font-size: 0.9rem;
}
.stat-value {
  font-weight: bold;
  font-size: var(--ex-font-xs, 0.75rem);
  color: var(--ex-text, #2c3e50);
}
.route-map-link {
  display: inline-block;
  margin-bottom: 4px;
  font-size: var(--ex-font-xs, 0.75rem);
  color: #1a7ea8;
  text-decoration: none;
  font-weight: bold;
}
.route-map-link:hover {
  text-decoration: underline;
}
</style>
