<script setup>
import { ref } from 'vue'

const welcomeMessage = 'Welcome to Jun Skala-Vue'
</script>

<template>
  <div class="practice-section">
    <h2>{{ welcomeMessage }}</h2>
    <p>{{ welcomeMessage.toUpperCase() }}</p>
    <p>{{ 'Random number: ' + Math.ceil(Math.random() * 100) }}</p>
    <p>{{ 'Random number 2: ' + Math.ceil(Math.random() * 50) }}</p>
  </div>
</template>
