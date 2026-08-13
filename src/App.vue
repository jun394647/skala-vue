<script setup>
import PracticeApp from './PracticeApp.vue'
import ExerciseApp from './ExerciseApp.vue'
import FarmApp from './FarmApp.vue'

// 'practice' = 수업 예제 화면, 'exercise' = 과제 제출용 화면, 'farm' = 농사 날씨 커스텀 화면
// 과제 제출 시에는 반드시 'exercise'로 되돌려 놓을 것
const MODE = 'exercise'
</script>

<template>
  <PracticeApp v-if="MODE === 'practice'" />
  <FarmApp v-else-if="MODE === 'farm'" />
  <ExerciseApp v-else />
</template>
