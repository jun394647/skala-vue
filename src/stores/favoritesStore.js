// 가이드 범위를 넘어선 추가 기능 — Pinia 스토어로 즐겨찾기 도시 관리
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref([])

  const favoriteCount = computed(() => favoriteIds.value.length)

  function isFavorite(id) {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id) {
    if (favoriteIds.value.includes(id)) {
      favoriteIds.value = favoriteIds.value.filter((favoriteId) => favoriteId !== id)
    } else {
      favoriteIds.value = [...favoriteIds.value, id]
    }
  }

  function clearFavorites() {
    favoriteIds.value = []
  }

  return {
    favoriteIds,
    favoriteCount,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  }
})
