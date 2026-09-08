<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center gap-6">
    <p class="text-8xl font-bold text-muted-foreground/40">404</p>
    <p class="text-lg text-muted-foreground">{{ t('common.pageNotFound') }}</p>
    <el-button type="primary" @click="router.replace('/dashboard')">
      {{ t('common.backHome') }}
    </el-button>
  </div>
</template>
