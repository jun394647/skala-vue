// 가이드 범위를 넘어선 추가 기능 — Pinia 스토어로 다크모드 상태 공유
import { ref } from 'vue'
import { defineStore } from 'pinia'

const DARK_MODE_KEY = 'exercise-dark-mode'

export const useUiStore = defineStore('ui', () => {
  const isDark = ref(localStorage.getItem(DARK_MODE_KEY) === '1')

  function toggleDarkMode() {
    isDark.value = !isDark.value
    localStorage.setItem(DARK_MODE_KEY, isDark.value ? '1' : '0')
  }

  return {
    isDark,
    toggleDarkMode,
  }
})
