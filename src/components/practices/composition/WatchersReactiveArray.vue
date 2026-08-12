<script setup>
import { reactive, ref, watch } from 'vue'

const cityList = reactive(['삼성전자', '카카오'])

const logAuto = ref('대기 중...')
const logCopy = ref('대기 중...')

watch(cityList, (newArr, oldArr) => {
  logAuto.value = `[자동 감시] 배열 변동 발생! 옛날길이인척하는:${oldArr.length} / 현재길이:${newArr.length}`
})

watch(
  () => [...cityList],
  (newArr, oldArr) => {
    logCopy.value = `[스냅샷 감시] 진짜 과거 길이:${oldArr.length} (데이터: ${oldArr}) ➡️ 바뀐 길이:${newArr.length}`
  },
)
</script>

<template>
  <div class="practice-section">
    <h2>reactive() 배열의 특정 인덱스/요소 감시하기</h2>
    <h3>관심 종목 목록 (reactive 배열)</h3>
    <p>
      현재 등록된 종목: <strong>{{ cityList }}</strong>
    </p>
    <button @click="cityList.push('네이버')">네이버 추가 (push)</button> &nbsp;
    <button @click="cityList.pop()">최근 종목 삭제 (pop)</button>

    <div class="monitor auto">
      <h3>👁️‍🗨️ 1) cityList 변수명 쌩으로 감시</h3>
      <p>{{ logAuto }}</p>
      <small>※ 주의: 이전 배열과 현재 배열의 내용물/길이가 똑같이 동기화되어 버립니다.</small>
    </div>

    <div class="monitor target">
      <h3>🎯 2) () => [...cityList] 복사본 감시</h3>
      <p>{{ logCopy }}</p>
      <small>※ 성공: 과거 배열에 들어있던 내용물이 지워지지 않고 정상 대조됩니다.</small>
    </div>
  </div>
</template>

<style scoped>
.monitor {
  font-weight: bold;
}
.auto {
  border-color: #ff7675;
  background: #fff5f5;
  color: #c0392b;
}
.target {
  border-color: #00b894;
  background: #e8f5e9;
  color: #27ae60;
}
</style>
