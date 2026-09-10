<script setup lang="ts">
/**
 * CssLiquidGlass —— 纯 CSS 液态玻璃卡片容器。
 * 与 LiquidGlass（位移滤镜）不同，这里用多层描边 + 高光渐变 + 模糊内缘
 * 模拟玻璃的厚度与反光，成本更低，适合大面积的卡片。
 */
import { computed, useSlots } from 'vue'
import { cn } from '@/utils'

const props = withDefaults(
  defineProps<{
    /** 圆角（px） */
    radius?: number
    /** 内容层附加类名 */
    class?: string
    /** 外层附加类名 */
    containerClass?: string
  }>(),
  { radius: 28, class: '', containerClass: '' },
)

const slots = useSlots()
/** 提供 #media 插槽时切换为「玻璃覆盖在媒体之上」的变体 */
const hasMedia = computed(() => Boolean(slots.media))

const style = computed(() => ({ '--lg-r': `${props.radius}px` }))
</script>

<template>
  <div
    class="css-liquid-glass"
    :class="cn(hasMedia && 'css-liquid-glass--media', containerClass)"
    :style="style"
  >
    <div v-if="hasMedia" class="css-liquid-glass__media">
      <slot name="media" />
    </div>

    <div class="css-liquid-glass__frost" aria-hidden="true" />
    <div class="css-liquid-glass__chrome" aria-hidden="true">
      <div class="css-liquid-glass__rim" />
    </div>

    <div :class="cn('css-liquid-glass__slot', props.class)">
      <slot />
    </div>
  </div>
</template>
