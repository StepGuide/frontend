<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { onMounted, computed } from 'vue'
import FloatingChat from '@/components/FloatingChat.vue'

const route = useRoute()

// Guardian 페이지에서는 FloatingChat을 숨김
const showFloatingChat = computed(() => {
  return route.name !== 'guardian'
})

</script>

<template>
  <RouterView />
  <FloatingChat v-if="showFloatingChat" />
</template>

