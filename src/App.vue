<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SilkBackground } from '@/components/canvas'
import BootLoader from '@/components/common/BootLoader.vue'
import { useTheme } from '@/composables/useTheme'

// 初始化配色模式（暗色 / 浅色），与 index.html 的首屏脚本保持一致
useTheme()
</script>

<template>
  <SilkBackground />
  <RouterView />
  <BootLoader />
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  min-height: 100%;
}
</style>
