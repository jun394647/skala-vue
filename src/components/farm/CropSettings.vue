<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  crops: { type: Array, required: true },
  selected: { type: Array, required: true },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selected', 'close'])

const STORAGE_KEY = 'farm-selected-crops'

const toggleCrop = (id) => {
  const next = props.selected.includes(id)
    ? props.selected.filter((cropId) => cropId !== id)
    : [...props.selected, id]
  if (next.length === 0) return
  emit('update:selected', next)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const parsed = JSON.parse(saved)
    const valid = parsed.filter((id) => props.crops.some((crop) => crop.id === id))
    if (valid.length) emit('update:selected', valid)
  } catch (error) {
    console.error('저장된 품목 설정을 불러오지 못했습니다:', error)
  }
})
</script>

<template>
  <div v-if="open" class="crop-settings-backdrop" @click.self="emit('close')">
    <div class="crop-settings-panel">
      <div class="crop-settings-header">
        <h2>⚙️ 품목 설정</h2>
        <button class="crop-settings-close" @click="emit('close')">닫기</button>
      </div>
      <p class="crop-settings-desc">우리 농가에 맞는 품목만 골라서 볼 수 있어요.</p>
      <div class="crop-settings-list">
        <label
          v-for="crop in crops"
          :key="crop.id"
          class="crop-settings-item"
          :class="{ active: selected.includes(crop.id) }"
        >
          <input
            type="checkbox"
            class="crop-settings-checkbox"
            :checked="selected.includes(crop.id)"
            @change="toggleCrop(crop.id)"
          />
          <span class="crop-settings-icon">{{ crop.icon }}</span>
          <span class="crop-settings-name">{{ crop.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crop-settings-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 8, 16, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.crop-settings-panel {
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(160deg, rgba(28, 42, 66, 0.98), rgba(12, 21, 38, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  padding: 24px 20px 28px;
  box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.5);
  color: #f3f6fa;
}

.crop-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.crop-settings-header h2 {
  font-size: calc(1.4rem * var(--font-scale, 1));
  font-weight: 800;
  margin: 0;
  color: #ffffff;
}

.crop-settings-close {
  font-size: calc(1.05rem * var(--font-scale, 1));
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #f3f6fa;
  cursor: pointer;
}

.crop-settings-desc {
  font-size: calc(1.05rem * var(--font-scale, 1));
  color: #a8b6cc;
  margin: 0 0 20px;
}

.crop-settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crop-settings-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.crop-settings-item.active {
  border-color: #f3a712;
  background: rgba(243, 167, 18, 0.1);
}

.crop-settings-checkbox {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  accent-color: #f3a712;
  cursor: pointer;
}

.crop-settings-icon {
  font-size: calc(1.6rem * var(--font-scale, 1));
}

.crop-settings-name {
  font-size: calc(1.15rem * var(--font-scale, 1));
  font-weight: 700;
  color: #f3f6fa;
}
</style>
