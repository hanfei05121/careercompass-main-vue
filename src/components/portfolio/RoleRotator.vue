<script setup lang="ts">
/**
 * RoleRotator —— 职位 / 标语形变轮播。
 *
 * 对 MorphingText 的开箱即用封装：内置左对齐、响应式字号与容器宽度，
 * 导入后只需传入 `texts` 即可使用，无需再写一串 !important 覆盖类。
 * 外边距等布局间距留给调用方通过 class 控制。
 */
import { computed } from 'vue'
import MorphingText from './MorphingText.vue'
import { cn } from '@/utils'

const props = withDefaults(
  defineProps<{
    /** 轮播文案，逐条形变切换 */
    texts: string[]
    /** 单次形变时长（秒） */
    morphTime?: number
    /** 形变之间的停顿（秒） */
    coolDownTime?: number
    /** 外层附加类名（用于控制间距等布局） */
    class?: string
  }>(),
  { morphTime: 1.5, coolDownTime: 0.5, class: '' },
)

const rootClass = computed(() => cn('role-rotator', props.class))
</script>

<template>
  <div :class="rootClass">
    <MorphingText
      :texts="props.texts"
      :morph-time="props.morphTime"
      :cool-down-time="props.coolDownTime"
      class="!mx-0 !h-12 !max-w-full !text-left !text-2xl !leading-tight md:!h-14 md:!text-3xl lg:!text-3xl"
    />
  </div>
</template>

<style scoped>
.role-rotator {
  position: relative;
  max-width: 36rem;
  overflow: hidden;
}
</style>
