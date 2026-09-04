<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="container mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Community Feed</h1>
      <p class="text-muted-foreground">Stay connected with the career community.</p>
    </div>

    <div class="text-center py-20 text-muted-foreground">
      <p>Dashboard content will be loaded here</p>
    </div>
  </div>
</template>
