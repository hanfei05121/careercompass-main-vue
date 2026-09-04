<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toaster from '@/components/ui/toast.vue'
</script>

<template>
  <RouterView />
  <Toaster />
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  height: 100%;
}
</style>
