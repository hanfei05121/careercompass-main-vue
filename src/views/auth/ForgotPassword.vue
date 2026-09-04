<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'

const email = ref('')
const isLoading = ref(false)
const sent = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  // TODO: Implement password reset
  await new Promise(resolve => setTimeout(resolve, 1000))
  sent.value = true
  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8 bg-background">
    <div class="w-full max-w-[420px]">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold tracking-tight mb-2">忘记密码？</h1>
        <p class="text-muted-foreground text-sm">输入你的邮箱以重置密码</p>
      </div>

      <form v-if="!sent" @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-2">
          <Label for="email" class="text-sm font-medium">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱地址"
            v-model="email"
            required
            class="h-12 bg-background border-border/60 focus:border-primary"
          />
        </div>

        <Button type="submit" class="w-full h-12 text-base font-medium" :disabled="isLoading">
          {{ isLoading ? '发送中...' : '发送重置链接' }}
        </Button>
      </form>

      <div v-else class="text-center space-y-4">
        <p class="text-muted-foreground">密码重置链接已发送至 {{ email }}</p>
        <router-link to="/login">
          <Button variant="outline" class="w-full h-12">返回登录</Button>
        </router-link>
      </div>

      <div class="text-center text-sm text-muted-foreground mt-8">
        <router-link to="/login" class="text-foreground font-medium hover:underline">
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>
