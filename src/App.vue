<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'
import FloatingChat from '@/components/FloatingChat.vue'

</script>

<template>
  <RouterView />
  <FloatingChat />
</template>

