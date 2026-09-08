<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 根据登录态做入口分流：已登录 → 平台内部（Dashboard），未登录 → 登录页。
// 用 watchEffect 而非 onMounted，避免登录态初始化（loading）晚于本组件挂载时卡在加载页。
watchEffect(() => {
  if (authStore.loading) return
  if (authStore.isAuthenticated) {
    if (authStore.isEmployer) {
      router.replace('/employer/dashboard')
    } else {
      router.replace('/dashboard')
    }
  } else {
    router.replace('/auth/login')
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
