<script setup>
// 최종 서비스 진입점. 과제 ①(Mockup)·②(컴포지션)·③(컴포넌트)의 코드는
// src/components/exercise/WeatherMockup.vue, WeatherComposition.vue, WeatherParent.vue에 그대로 남아있고,
// 화면은 과제 ④(라우터)·⑤(Pinia 스토어)·⑥(Axios) 가 통합된 아래 대시보드 하나로 합쳐서 보여준다.
import { watch, onMounted, onUnmounted } from 'vue'
import { useUiStore } from './stores/uiStore'

const uiStore = useUiStore()

const applyDarkMode = () => {
  document.documentElement.classList.toggle('dark', uiStore.isDark)
}

watch(() => uiStore.isDark, applyDarkMode)
onMounted(applyDarkMode)
onUnmounted(() => {
  document.documentElement.classList.remove('dark')
})
</script>

<template>
  <div class="dashboard-wrapper">
    <nav class="navigation-bar">
      <RouterLink to="/running" class="nav-item">🏃 러닝 대시보드</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/settings" class="nav-item">⚙️ 설정</RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
