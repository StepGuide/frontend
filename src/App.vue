<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { onMounted } from 'vue'
import { testConnection } from '@/api/testApi'

onMounted(() => {
  testConnection()
})
</script>

<template>

  
  <RouterView />
  
</template>

