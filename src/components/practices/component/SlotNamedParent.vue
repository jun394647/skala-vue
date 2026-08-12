<script setup>
import SlotNamedChild from './SlotNamedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Named Slot 주입 실습</h2>
    <SlotNamedChild>
      <template v-slot:header>
        <h3>이번 달 거래 명세서</h3>
      </template>
      <p>"이번 달 카드 결제 총액은 458,000원이며, 총 12건의 거래가 발생했습니다."</p>
    </SlotNamedChild>
  </div>
</template>
