<script setup>
// 과제 ⑥: Axios 실시간 API 연동 — Promise.all 병렬 요청, isLoading/에러 처리
// (컴포넌트는 과제 ③, 라우팅은 과제 ④, 단위 전환은 과제 ⑤ 것을 그대로 재사용)
// 즐겨찾기는 가이드 범위를 넘어선 추가 기능
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import { useFavoritesStore } from '../stores/favoritesStore'

const router = useRouter()
const route = useRoute()
const favoritesStore = useFavoritesStore()

const RECENT_SEARCH_KEY = 'exercise-recent-searches'

const weatherList = ref([])
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const isLoading = ref(false)
const showFavoritesOnly = ref(false)
const recentSearches = ref(JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || '[]'))

const saveRecentSearch = (query) => {
  const trimmed = query.trim()
  if (!trimmed) return
  recentSearches.value = [trimmed, ...recentSearches.value.filter((item) => item !== trimmed)].slice(0, 5)
  localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recentSearches.value))
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

const fetchRealTimeWeather = async () => {
  isLoading.value = true
  try {
    const [seoulRes, suwonRes, busanRes] = await Promise.all([
      axios.get(`${BASE_URL}?q=Seoul&appid=${API_KEY}&units=metric&lang=kr`),
      axios.get(`${BASE_URL}?q=Suwon&appid=${API_KEY}&units=metric&lang=kr`),
      axios.get(`${BASE_URL}?q=Busan&appid=${API_KEY}&units=metric&lang=kr`),
    ])

    weatherList.value = [
      {
        id: 'city_01',
        name: '서울',
        temp: seoulRes.data.main.temp,
        status: seoulRes.data.weather[0].description,
      },
      {
        id: 'city_02',
        name: '수원',
        temp: suwonRes.data.main.temp,
        status: suwonRes.data.weather[0].description,
      },
      {
        id: 'city_03',
        name: '부산',
        temp: busanRes.data.main.temp,
        status: busanRes.data.weather[0].description,
      },
    ]
    console.log('🟢 [API 통신 완료] 메인 대시보드 실시간 기상 장부 동기화:', weatherList.value)
  } catch (error) {
    console.error('🔴 날씨 API 연동 실패:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  fetchRealTimeWeather()
})

let recentSearchTimer = null
watch(searchQuery, (newQuery) => {
  router.push({
    path: route.path,
    query: { search: newQuery || undefined },
  })
  clearTimeout(recentSearchTimer)
  recentSearchTimer = setTimeout(() => saveRecentSearch(newQuery), 800)
})

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  const base = query ? weatherList.value.filter((item) => item.name.includes(query)) : weatherList.value
  if (!showFavoritesOnly.value) return base
  return base.filter((item) => favoritesStore.isFavorite(item.id))
})

const handleDetailJump = (id) => {
  router.push(`/weather/${id}`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
      <div v-if="recentSearches.length" class="recent-search-chips">
        <button
          v-for="term in recentSearches"
          :key="term"
          class="recent-search-chip"
          @click="searchQuery = term"
        >
          {{ term }}
        </button>
      </div>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황 (실시간 기상청 연동)</h3>

      <label class="favorite-filter">
        <input type="checkbox" v-model="showFavoritesOnly" />
        ⭐ 즐겨찾기만 보기 ({{ favoritesStore.favoriteCount }})
      </label>

      <p
        v-if="isLoading"
        style="text-align: center; color: #3498db; font-weight: bold; padding: 20px 0"
      >
        🔄 글로벌 기상 위성으로부터 실시간 기상 데이터를 수신 중입니다...
      </p>

      <template v-else>
        <WeatherCard
          v-for="item in filteredWeatherList"
          :key="item.id"
          :city-item="item"
          @select-card="(msg) => (selectedCityInfo = msg)"
          @click-detail="handleDetailJump(item.id)"
        />

        <p
          v-if="filteredWeatherList.length === 0"
          style="text-align: center; color: #e74c3c; padding: 10px 0"
        >
          😭 검색 결과와 일치하는 도시가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>
    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.recent-search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.recent-search-chip {
  border: 1px solid var(--ex-border, #e9ecef);
  background: var(--ex-card-bg, #fff);
  color: var(--ex-text-soft, #7f8c8d);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: var(--ex-font-xs, 0.75rem);
  cursor: pointer;
}
.recent-search-chip:hover {
  color: var(--ex-text, #2c3e50);
  border-color: var(--ex-text-soft, #7f8c8d);
}
.favorite-filter {
  display: block;
  margin-bottom: 12px;
  cursor: pointer;
}
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
</style>
