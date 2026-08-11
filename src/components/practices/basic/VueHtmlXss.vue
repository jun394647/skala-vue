<script setup>
import { ref } from 'vue'

const inputValue = ref('')
const message = ref('')

function showMessage() {
  message.value = inputValue.value
}
</script>

<template>
  <div class="practice-section">
    <h2>v-html XSS 학습</h2>
    <input v-model="inputValue" placeholder="여기에 태그를 포함해 입력해보세요" />
    <button @click="showMessage">확인</button>
    <div v-html="message"></div>
  </div>
</template>
