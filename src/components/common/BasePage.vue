<script setup lang="ts">
/**
 * BasePage —— 页面骨架：标题 / 副标题 / 操作区 / 内容区
 * 所有受保护业务页统一使用，保证视觉与间距一致
 */
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="space-y-6">
    <div v-if="title || $slots.title" class="flex items-start justify-between gap-4">
      <div>
        <h1 class="page-title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="subtitle || $slots.subtitle" class="page-subtitle mt-1">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </div>
</template>
