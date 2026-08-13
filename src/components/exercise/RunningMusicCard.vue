<script setup>
// 가이드 범위를 넘어선 추가 기능 — YouTube Data API로 날씨에 맞는 러닝 음악 추천
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  weatherList: {
    type: Array,
    required: true,
  },
})

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

const video = ref(null)
const moodLabel = ref('')
const isLoading = ref(false)
const hasError = ref(false)

const pickMood = (list) => {
  const avgTemp = list.reduce((sum, item) => sum + item.temp, 0) / list.length
  const isRainy = list.some((item) => item.status.includes('비'))

  if (isRainy) {
    return { query: '비오는 날 잔잔한 러닝 음악 플레이리스트', label: '비 오는 날엔 차분하게' }
  }
  if (avgTemp >= 28) {
    return { query: '무더운 여름 신나는 러닝 플레이리스트', label: '더운 날씨엔 신나게' }
  }
  if (avgTemp <= 5) {
    return { query: '추운 날씨 워밍업 러닝 음악', label: '추운 날씨엔 몸을 풀며' }
  }
  return { query: '선선한 날씨 러닝 플레이리스트', label: '딱 좋은 러닝 날씨' }
}

const fetchRunningMusic = async (list) => {
  if (!list.length) return
  isLoading.value = true
  hasError.value = false
  const mood = pickMood(list)
  moodLabel.value = mood.label
  try {
    const response = await axios.get(SEARCH_URL, {
      params: {
        part: 'snippet',
        q: mood.query,
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_API_KEY,
      },
    })
    const item = response.data.items?.[0]
    video.value = item ? { id: item.id.videoId, title: item.snippet.title } : null
  } catch (error) {
    console.error('🔴 러닝 음악 추천 실패:', error)
    hasError.value = true
    video.value = null
  } finally {
    isLoading.value = false
  }
}

watch(() => props.weatherList, fetchRunningMusic, { immediate: true })
</script>

<template>
  <el-card class="running-music-card" shadow="hover">
    <template #header>🎵 {{ moodLabel || '오늘의 러닝 음악' }}</template>

    <p v-if="isLoading">추천곡을 찾는 중입니다...</p>
    <p v-else-if="hasError">추천곡을 불러오지 못했습니다. YouTube API 키를 확인해 주세요.</p>
    <template v-else-if="video">
      <iframe class="music-embed" :src="`https://www.youtube.com/embed/${video.id}`" title="추천 러닝 음악" frameborder="0" allowfullscreen></iframe>
      <p class="music-title">{{ video.title }}</p>
    </template>
    <p v-else>날씨 정보를 불러오면 추천곡이 표시됩니다.</p>
  </el-card>
</template>

<style scoped>
.running-music-card {
  margin-bottom: 15px;
  --el-card-bg-color: var(--ex-card-bg, #fff);
  color: var(--ex-text, #2c3e50);
}
.music-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
}
.music-title {
  margin: 8px 0 0;
  font-size: var(--ex-font-sm, 14px);
  color: var(--ex-text, #2c3e50);
}
</style>
