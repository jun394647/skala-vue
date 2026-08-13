<script setup>
// 가이드 범위를 넘어선 추가 기능 — 설정 페이지: 단위 전환(과제⑤ 재사용) + 다크모드 + 즐겨찾기 초기화
import { useUiStore } from '../stores/uiStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import UnitToggler from '../components/exercise/UnitToggler.vue'

const uiStore = useUiStore()
const favoritesStore = useFavoritesStore()
</script>

<template>
  <div class="settings-view">
    <h3>⚙️ 설정</h3>

    <div class="setting-row">
      <div class="setting-label">
        <strong>화면 테마</strong>
        <span class="setting-desc">라이트모드와 다크모드를 전환합니다.</span>
      </div>
      <button class="theme-toggle-btn" @click="uiStore.toggleDarkMode">
        {{ uiStore.isDark ? '☀️ 라이트모드로' : '🌙 다크모드로' }}
      </button>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        <strong>날씨 단위</strong>
        <span class="setting-desc">섭씨(℃)와 화씨(℉)를 전환합니다.</span>
      </div>
      <UnitToggler />
    </div>

    <div class="setting-row">
      <div class="setting-label">
        <strong>즐겨찾기 초기화</strong>
        <span class="setting-desc">즐겨찾기한 도시 {{ favoritesStore.favoriteCount }}개를 모두 비웁니다.</span>
      </div>
      <button class="clear-btn" @click="favoritesStore.clearFavorites">전체 초기화</button>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  margin: 0 auto;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--ex-input-bg, #f8f9fa);
  border: 1px solid var(--ex-border, #e9ecef);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--ex-text, #2c3e50);
}
.setting-desc {
  font-size: var(--ex-font-xs, 12px);
  color: var(--ex-text-soft, #7f8c8d);
}
.theme-toggle-btn,
.clear-btn {
  flex-shrink: 0;
  border: 1px solid var(--ex-border, #e9ecef);
  background: var(--ex-card-bg, #fff);
  color: var(--ex-text, #2c3e50);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: var(--ex-font-sm, 14px);
  font-weight: bold;
  cursor: pointer;
}
.clear-btn {
  border-color: #e74c3c;
  color: #e74c3c;
}
</style>
