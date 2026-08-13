<template>
  <div class="base-dashboard-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.base-dashboard-card {
  background: var(--ex-input-bg, #f8f9fa);
  color: var(--ex-text, #2c3e50);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid var(--ex-border, #e9ecef);
}
</style>
