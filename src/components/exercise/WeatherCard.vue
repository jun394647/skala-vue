<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '../../stores/configStore'
import { useFavoritesStore } from '../../stores/favoritesStore'
import { friendlyStatus } from '../../utils/weatherText'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()
const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})

const handleToggleFavorite = () => {
  favoritesStore.toggleFavorite(props.cityItem.id)
  ElMessage({
    message: favoritesStore.isFavorite(props.cityItem.id)
      ? `⭐ ${props.cityItem.name}을(를) 즐겨찾기에 추가했어요.`
      : `${props.cityItem.name}을(를) 즐겨찾기에서 뺐어요.`,
    type: 'success',
    duration: 1500,
  })
}
</script>

<template>
  <div class="weather-card" @click="emit('select-card', `${cityItem.name}이 선택되었습니다.`)">
    <div class="card-head">
      <button class="btn-favorite" @click.stop="handleToggleFavorite">
        {{ favoritesStore.isFavorite(cityItem.id) ? '⭐' : '☆' }}
      </button>
      <h4>{{ cityItem.name }} ({{ friendlyStatus(cityItem.status) }})</h4>
    </div>
    <p>현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>

    <span v-if="cityItem.temp >= 25" class="badge hot">🔥 더움</span>
    <span v-else class="badge cool">❄️ 선선함</span>

    <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">
      상세보기
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  background: var(--ex-card-bg, #fff);
  border: 1px solid var(--ex-border, #dee2e6);
  color: var(--ex-text, #2c3e50);
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: var(--ex-font-xs, 12px);
  border-radius: 4px;
  color: #fff;
}
.hot {
  background-color: #ff7675;
}
.cool {
  background-color: #74b9ff;
}
.btn-detail {
  position: absolute;
  right: 12px;
  top: 15px;
  padding: 6px 10px;
  font-size: var(--ex-font-sm, 14px);
  cursor: pointer;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 70px;
}
.card-head h4 {
  margin: 0;
}
.btn-favorite {
  border: none;
  background: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
</style>
