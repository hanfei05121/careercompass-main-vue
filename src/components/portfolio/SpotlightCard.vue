<script setup lang="ts">
/**
 * SpotlightCard —— 光标聚光卡片。
 * 逐项对齐参考站点的 CardSpotlight：
 * 指针移动时把 --spot-x / --spot-y 写成像素坐标，卡片的
 * .card-spotlight-glow 图层在 :hover 时淡入一道径向光晕；
 * 指针离开后把坐标甩到画布外，避免下一次悬停时闪一下。
 */
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { cn } from '@/utils'

const props = withDefaults(
  defineProps<{
    /** 光晕半径（px） */
    gradientSize?: number
    /** 光晕颜色，留空则按主题取粉紫 */
    gradientColor?: string
    /** 光晕不透明度 */
    gradientOpacity?: number
    /** 内部路由跳转 */
    to?: string
    /** 外部链接 */
    href?: string
    /** 外层附加类名 */
    class?: string
    /** 内容层附加类名 */
    slotClass?: string
  }>(),
  {
    gradientSize: 280,
    gradientColor: '',
    gradientOpacity: 0.55,
    to: '',
    href: '',
    class: '',
    slotClass: '',
  },
)

const { isDark } = useTheme()

const spotColor = computed(() => {
  if (props.gradientColor) return props.gradientColor
  return isDark.value ? 'hsl(331 57% 69% / 0.45)' : 'hsl(332 81% 81% / 0.28)'
})

const style = computed(() => ({
  '--spot-color': spotColor.value,
  '--spot-size': `${props.gradientSize}px`,
  '--spot-opacity': String(props.gradientOpacity),
}))

function onMove(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

function onLeave(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  el.style.setProperty('--spot-x', `-${props.gradientSize * 10}px`)
  el.style.setProperty('--spot-y', `-${props.gradientSize * 10}px`)
}
</script>

<template>
  <component
    :is="to ? 'router-link' : href ? 'a' : 'div'"
    :to="to || undefined"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :class="
      cn(
        'group relative flex w-full overflow-hidden rounded-[1.5rem] border border-border/60 bg-card/70 text-card-foreground shadow-[0_10px_28px_-16px_var(--shadow-bloom)] dark:border-white/15 dark:bg-card/60 dark:shadow-none',
        'transition duration-500 hover:border-primary/30',
        props.class,
      )
    "
    :style="style"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <div class="card-spotlight-glow" aria-hidden="true" />
    <div :class="cn('relative z-10 w-full', props.slotClass)">
      <slot />
    </div>
  </component>
</template>
