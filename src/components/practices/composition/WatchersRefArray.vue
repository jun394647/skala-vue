<script setup>
import { ref, watch } from 'vue'

const teamMembers = ref(['김유신', '을지문덕', '강감찬'])
const logMember = ref('대기 중...')

const cityWeather = ref([
  { name: '서울', temp: 25 },
  { name: '수원', temp: 22 },
  { name: '부산', temp: 27 },
])
const logWeather = ref('대기 중...')

watch(
  () => teamMembers.value[0],
  (newNames, oldNames) => {
    logMember.value = `[방출/영입] 0번 선수 교체: ${oldNames} ➡️ ${newNames}`
  },
)

watch(
  () => cityWeather.value[0],
  (newSeoul) => {
    logWeather.value = `[날씨 변동] 서울의 온도가 현재 ${newSeoul.temp}°C 로 변경되었습니다.`
  },
  { deep: true },
)
</script>

<template>
  <div class="practice-section">
    <h2>ref 배열의 특정 인덱스/요소 감시하기</h2>
    <h3>🏃‍♂️ 1) 문자열 배열: 현재 0번 멤버 [ {{ teamMembers[0] }} ]</h3>
    <button @click="teamMembers[0] = '손흥민'">0번 멤버를 손흥민으로 교체</button>
    <p class="log text">로그: {{ logMember }}</p>
    <h3>⛅ 2) 객체형 배열: 현재 {{ cityWeather[0].name }} 기온 [ {{ cityWeather[0].temp }}°C ]</h3>
    <button @click="cityWeather[0].temp++">서울 기온 1도 올리기 (temp++)</button>
    <p class="log object">로그: {{ logWeather }}</p>
    <button @click="cityWeather.shift()">첫번째배열제거</button>
  </div>
</template>

<style scoped>
.log {
  margin-top: 10px;
  font-weight: bold;
}
.text {
  color: #0984e3;
}
.object {
  color: #6c5ce7;
}
</style>
