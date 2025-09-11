<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { onMounted, computed } from 'vue';
import FloatingChat from '@/components/FloatingChat.vue';

const route = useRoute();

// Guardian 페이지에서는 FloatingChat을 숨김
const showFloatingChat = computed(() => {
  return route.name !== 'guardian';
});
// TTS 컨트롤러 컴포넌트 import 추가
import TTSController from '@/components/commons/TTSController.vue';
</script>

<template>
  <RouterView />
  <FloatingChat v-if="showFloatingChat" />
  <!-- TTS 컨트롤러 추가 (전역으로 항상 표시) -->
  <TTSController />
</template>

<style>
/* TTS 관련 전역 스타일 추가 */
.tts-highlight {
  background-color: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 4px;
  padding: 2px 4px;
  animation: tts-glow 1s ease-in-out;
}

@keyframes tts-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
  }
}
</style>
