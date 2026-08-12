<script setup>
import { ref, watch } from 'vue'

const currentCity = ref('삼성전자')
const logMessage = ref('아직 감시 시스템이 작동하지 않았습니다.')

watch(currentCity, (newValue, oldValue) => {
  logMessage.value = `📍 감시자 발동! [${oldValue}]에서 [${newValue}]로 변경됨.`
  console.log(`🤖 [서버 요청 완료] 증권 서버에서 ${newValue}의 시세 API를 다시 조회합니다...`)
})
</script>

<template>
  <div class="practice-section">
    <h2>감시자 watch()의 원리와 실무 활용</h2>
    <h3>📈 종목 선택 제어판</h3>
    <p>현재 선택된 종목: {{ currentCity }}</p>
    <button @click="currentCity = '삼성전자'">삼성전자 선택</button> &nbsp; <button @click="currentCity = '카카오'">카카오 선택</button> &nbsp;
    <button @click="currentCity = '네이버'">네이버 선택</button>

    <div class="monitor">
      <h3>👁️‍🗨️ 파수꾼(watch) 모니터링 시스템</h3>
      <p>{{ logMessage }}</p>
      <small style="color: gray">(버튼을 누른 후 브라우저 콘솔창 F12를 확인해 보세요)</small>
    </div>
  </div>
</template>

<style scoped>
.monitor {
  border-color: #0984e3;
  background: #e3fafc;
}
</style>
