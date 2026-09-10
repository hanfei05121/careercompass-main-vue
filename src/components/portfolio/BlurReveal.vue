<script setup lang="ts">
/**
 * BlurReveal —— 模糊位移入场动画，参数对齐参考站点的 BlurReveal。
 * 初始：opacity 0 / blur 12px / translateY 18px
 * 缓动：cubic-bezier(.32,.72,0,1)
 *
 * mode = 'ready'：等首屏就绪（启动遮罩结束）后播放，用于首屏内容；
 * mode = 'view' ：滚动进入视口时播放一次，用于各分区内容。
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useSiteReady } from '@/composables/useSiteReady'

const props = withDefaults(
  defineProps<{
    mode?: 'ready' | 'view'
    /** 单段动画时长（秒） */
    duration?: number
    /** 延迟（秒） */
    delay?: number
    /** 初始模糊半径（px） */
    blur?: number
    /** 初始下移距离（px） */
    yOffset?: number
    /** 进入视口的触发阈值 */
    amount?: number
    class?: string
  }>(),
  {
    mode: 'view',
    duration: 0.8,
    delay: 0.05,
    blur: 12,
    yOffset: 18,
    amount: 0.25,
    class: '',
  },
)

const el = ref<HTMLElement | null>(null)
const entered = ref(false)
const { ready } = useSiteReady()
const { reduced } = useReducedMotion()

let observer: IntersectionObserver | null = null

const shown = computed(
  () => reduced.value || (props.mode === 'ready' ? ready.value : entered.value),
)

const style = computed(() => ({
  '--reveal-duration': `${props.duration}s`,
  '--reveal-delay': `${props.delay}s`,
  '--reveal-blur': `blur(${props.blur}px)`,
  '--reveal-y': `translateY(${props.yOffset}px)`,
}))

onMounted(() => {
  if (props.mode === 'ready') return

  const node = el.value
  if (!node || typeof IntersectionObserver === 'undefined') {
    entered.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return
      entered.value = true
      observer?.disconnect()
      observer = null
    },
    { threshold: props.amount },
  )
  observer.observe(node)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div
    ref="el"
    class="blur-reveal"
    :class="[{ 'is-shown': shown }, props.class]"
    :style="style"
  >
    <slot />
  </div>
</template>

<style scoped>
.blur-reveal {
  opacity: 0;
  filter: var(--reveal-blur, blur(12px));
  transform: var(--reveal-y, translateY(18px));
  transition:
    opacity var(--reveal-duration, 0.8s) cubic-bezier(0.32, 0.72, 0, 1) var(--reveal-delay, 0.05s),
    filter var(--reveal-duration, 0.8s) cubic-bezier(0.32, 0.72, 0, 1) var(--reveal-delay, 0.05s),
    transform var(--reveal-duration, 0.8s) cubic-bezier(0.32, 0.72, 0, 1) var(--reveal-delay, 0.05s);
}

.blur-reveal.is-shown {
  opacity: 1;
  filter: blur(0px);
  transform: translateY(0);
}
</style>
