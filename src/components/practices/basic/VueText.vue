<script setup>
const content = '반갑습니다! <strong>Skala-Vue</strong> 실습 중입니다.'
</script>

<template>
  <div class="practice-section">
    <h2>v-text 디렉티브 학습</h2>
    <h3>1) 일반 보간법 {{}} 결과:</h3>
    <p>출력: {{ content }}</p>
    <br />

    <h3>2) v-text 디렉티브 결과:</h3>
    <p v-text="'출력: ' + content"></p>
    <br />

    <h3>3) v-html 결과 비교:</h3>
    <p v-html="content"></p>
  </div>
</template>
