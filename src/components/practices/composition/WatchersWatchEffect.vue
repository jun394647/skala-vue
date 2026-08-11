<script setup>
import { ref, watchEffect } from 'vue'

const username = ref('박준형')
const age = ref(26)
const logMessage = ref('대기 중...')

watchEffect(() => {
  // Vue가 자동으로 감시 리스트에 등록
  logMessage.value = `[자동 감지] 이름: ${username.value} / 나이: ${age.value}세`

  console.log('🤖 watchEffect가 내부 변수 변경을 감지하여 실행되었습니다.')
})
</script>

<template>
  <div class="practice-section">
    <h2>자동 감시자 watchEffect()</h2>
    <p>이름: {{ username }} / 나이: {{ age }}세</p>
    <button @click="username = '강병호'">이름을 '강병호'로 변경</button> &nbsp;
    <button @click="age++">나이 한 살 추가 (age++)</button>

    <div class="monitor">
      <h3>👁️‍🗨️ watchEffect 자동 모니터링 시스템</h3>
      <p>{{ logMessage }}</p>
      <small style="color: gray"
        >※ 새로고침하자마자 버튼을 안 눌러도 로그가 이미 찍혀있는 특징을 주목!!!!!</small
      >
    </div>
  </div>
</template>

<style scoped>
.monitor {
  border-color: #e74c3c;
  background: #fff5f5;
  font-weight: bold;
}
</style>
