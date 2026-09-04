<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AUTH_ENABLED } from '@/lib/authConfig'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // 鉴权关闭：直接进入 Dashboard
  if (!AUTH_ENABLED) {
    router.push('/dashboard')
    return
  }

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
      <p class="text-muted-foreground">正在加载职途指南...</p>
    </div>
  </div>
</template>
