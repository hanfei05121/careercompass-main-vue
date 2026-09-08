<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import enUsLocale from 'element-plus/es/locale/lang/en'
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn'
import Toaster from '@/components/ui/toast.vue'
import { currentLocale } from '@/locales'

/** Element Plus 组件库语言跟随站点语言切换 */
const elementLocale = computed(() =>
  currentLocale.value === 'zh-CN' ? zhCnLocale : enUsLocale
)
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <RouterView />
    <Toaster />
  </ElConfigProvider>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  height: 100%;
}
</style>
