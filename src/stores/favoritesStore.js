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

  return {
    favoriteIds,
    favoriteCount,
    isFavorite,
    toggleFavorite,
  }
})
