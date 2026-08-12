<script setup>
import SlotDefaultChild from '@/components/practices/component/SlotDefaultChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Default Slot 레이아웃 주입 실습</h2>
    <SlotDefaultChild>
      <p>이번 달 카드 결제 내역 3건이 등록되었습니다.</p>
    </SlotDefaultChild>
    <SlotDefaultChild>
      <h2 style="color: #e74c3c">🔥 잔액 부족 경고</h2>
      <button>확인</button>
    </SlotDefaultChild>
    <SlotDefaultChild> </SlotDefaultChild>
  </div>
</template>
