<script setup>
import PracticeApp from './PracticeApp.vue'
import ExerciseApp from './ExerciseApp.vue'

const MODE = 'practice'
</script>

<template>
  <PracticeApp v-if="MODE === 'practice'" />
  <ExerciseApp v-else />
</template>
