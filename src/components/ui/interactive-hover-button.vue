<script setup lang="ts">
/**
 * InteractiveHoverButton —— 交互悬停按钮。
 * 对齐参考站点实现：
 * 左侧小圆点在 hover 时以 scale 放大成整块药丸底色，
 * 同时原文案右移淡出，覆盖层从右侧滑入并带出箭头。
 */
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  /** 按钮文案 */
  text?: string
  /** 原生 type */
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Button',
  type: 'button',
  disabled: false,
  class: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

/**
 * 实心变体：调用方传入 `bg-primary` 时（参考站点的 `group-[.bg-primary]` 用法），
 * 圆点要换成主色前景色，滑动文案要换成主色。
 */
const isFilled = computed(() => /(^|\s)bg-primary(\s|$)/.test(props.class))
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="
      cn(
        'group bg-card relative w-auto cursor-pointer overflow-hidden rounded-full border border-primary/25 p-2 px-6 text-center font-semibold disabled:cursor-not-allowed disabled:opacity-50',
        isFilled && 'is-filled',
        props.class,
      )
    "
    @click="emit('click', $event)"
  >
    <!-- 默认态：小圆点 + 文案 -->
    <div class="relative z-[2] flex items-center gap-2">
      <div class="ihb-dot bg-primary size-2 rounded-lg" />
      <span class="ihb-label">{{ props.text }}</span>
    </div>

    <!-- hover 态：文案 + 箭头从右侧滑入 -->
    <div class="ihb-overlay">
      <span class="whitespace-nowrap">{{ props.text }}</span>
      <ArrowRight class="size-4" />
    </div>
  </button>
</template>

<style scoped>
/* 圆点放大成整块底色：参考站点用 scale: 100.8 实现填充效果 */
.ihb-dot {
  transition: scale 0.3s;
  scale: 1;
}

.group:hover .ihb-dot {
  scale: 100.8;
}

.ihb-label {
  display: inline-block;
  white-space: nowrap;
  transition: all 0.3s;
}

.group:hover .ihb-label {
  transform: translateX(3rem);
  opacity: 0;
}

.ihb-overlay {
  position: absolute;
  top: 0;
  z-index: 10;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transform: translateX(3rem);
  opacity: 0;
  transition: all 0.3s;
  color: hsl(var(--primary-foreground));
}

.group:hover .ihb-overlay {
  transform: translateX(-1.25rem);
  opacity: 1;
}

/* 实心变体：圆点与滑动文案改用对比色 */
.is-filled .ihb-dot {
  background: hsl(var(--primary-foreground));
}

.is-filled .ihb-overlay {
  color: hsl(var(--primary));
}
</style>
