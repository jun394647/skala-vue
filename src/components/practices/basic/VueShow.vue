<script setup>
import { ref } from 'vue'
const isVisible = ref(false)
</script>

<template>
  <div class="practice-section">
    <h2>v-show 디렉티브 학습</h2>
    <button @click="isVisible = !isVisible">화면 토글하기</button>
    <br />
    <div v-show="isVisible" class="box">
      <p>v-show 상자</p>
      <p>조건이 false가 되면 CSS display: none이 붙습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.box {
  padding: 20px;
  margin-top: 5px;
  color: white;
  border-radius: 12px;
  background-color: #8e44ad;
}
</style>
