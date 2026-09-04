<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.loading) {
    if (authStore.isAuthenticated) {
      if (authStore.isEmployer) {
        router.push('/employer/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      router.push('/login')
    }
  }
})
</script>

<template>
  <div class="flex h-screen w-full items-center justify-center bg-background">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p class="text-muted-foreground">Loading CareerCompass...</p>
    </div>
  </div>
</template>
