<script setup>
</script>

<template>
  <div class="practice-section">
    <h2>Scoped 스타일 및 외부 CSS 활용</h2>
    <p class="title">이 글자는 이 컴포넌트 내부에서만 분홍색이 됩니다.</p>
    <button class="btn-external">외부 CSS에서 불러온 버튼 스타일</button>
  </div>
</template>

<style scoped>
/* 내 방 전용 타이틀 디자인 */
.title {
  color: #e84393;
  font-weight: bold;
  font-size: 22px;
}
</style>
