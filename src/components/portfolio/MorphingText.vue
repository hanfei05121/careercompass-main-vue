<script setup lang="ts">
/**
 * MorphingText —— 文字形变轮播。
 *
 * 逐行对齐参考站点的 MorphingText：
 * - 两个绝对定位的 span 叠在一起（`absolute inset-x-0 top-0 m-auto inline-block w-full`）
 * - 通过 blur + opacity 交叉过渡：blur = min(8/x - 8, 100)，opacity = x^0.4
 * - 外层套一个 SVG 阈值滤镜（feColorMatrix alpha×255-140）+ blur(0.6px)，
 *   把模糊文字压成硬边形状，所以形变看起来像「融成一团再凝回文字」
 * - 默认每 1.5s 换一次，冷却 0.5s
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useSiteReady } from '@/composables/useSiteReady'

const props = withDefaults(
  defineProps<{
    /** 轮播文案 */
    texts: string[]
    /** 单次形变时长（秒） */
    morphTime?: number
    /** 形变之间的停顿（秒） */
    coolDownTime?: number
    class?: string
  }>(),
  { morphTime: 1.5, coolDownTime: 0.5, class: '' },
)

/** 两层文字的公共定位类，与参考站点一致 */
const SLOT_CLASS = 'absolute inset-x-0 top-0 m-auto inline-block w-full'
const FILTER_ID = 'morphing-text-threshold'

const rootRef = ref<HTMLElement | null>(null)
const text1Ref = ref<HTMLElement | null>(null)
const text2Ref = ref<HTMLElement | null>(null)

const { ready } = useSiteReady()
const { reduced } = useReducedMotion()

const textIndex = ref(0)
/** 形变进度与冷却计时 */
let morph = 0
let coolDown = 0
let lastTime = 0
let morphing = false
let rafId = 0
let started = false
let inView = true
let pageVisible = true
let observer: IntersectionObserver | null = null

function setStyles(fraction: number) {
  const t1 = text1Ref.value
  const t2 = text2Ref.value
  if (!t1 || !t2 || props.texts.length === 0) return

  const next = fraction
  const prev = 1 - fraction

  t2.style.filter = `blur(${Math.min(8 / next - 8, 100)}px)`
  t2.style.opacity = `${next ** 0.4 * 100}%`

  t1.style.filter = `blur(${Math.min(8 / prev - 8, 100)}px)`
  t1.style.opacity = `${prev ** 0.4 * 100}%`

  t1.textContent = props.texts[textIndex.value % props.texts.length] ?? ''
  t2.textContent = props.texts[(textIndex.value + 1) % props.texts.length] ?? ''
}

/** 推进形变 */
function doMorph() {
  morphing = false
  morph -= coolDown
  coolDown = 0

  let fraction = morph / props.morphTime
  if (fraction > 1) {
    coolDown = props.coolDownTime
    fraction = 1
  }

  setStyles(fraction)
  if (fraction === 1) textIndex.value += 1
}

/** 形变结束后的静置态 */
function doCooldown() {
  morph = 0
  if (morphing) return
  morphing = true
  const t1 = text1Ref.value
  const t2 = text2Ref.value
  if (!t1 || !t2) return
  t2.style.filter = 'none'
  t2.style.opacity = '100%'
  t1.style.filter = 'none'
  t1.style.opacity = '0%'
}

/** 初始画面：显示第一条 */
function firstRender() {
  const t1 = text1Ref.value
  const t2 = text2Ref.value
  if (!t1 || !t2) return
  t1.textContent = props.texts[0] ?? ''
  t2.textContent = props.texts[1] ?? props.texts[0] ?? ''
  t1.style.filter = 'none'
  t1.style.opacity = '100%'
  t2.style.filter = 'none'
  t2.style.opacity = '0%'
}

function animate(newTime: number) {
  rafId = 0
  if (!started) return

  if (lastTime === 0) lastTime = newTime
  const dt = Math.min(0.05, (newTime - lastTime) / 1000)
  lastTime = newTime

  coolDown -= dt
  if (coolDown <= 0) doMorph()
  else doCooldown()

  if (inView && pageVisible) rafId = requestAnimationFrame(animate)
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function syncVisibility() {
  pageVisible = document.visibilityState === 'visible'
  if (started && inView && pageVisible) {
    if (!rafId) {
      lastTime = 0
      rafId = requestAnimationFrame(animate)
    }
    return
  }
  stopLoop()
}

function start() {
  if (started) return
  started = true
  firstRender()
  lastTime = 0
  syncVisibility()
}

onMounted(() => {
  // 减少动效时只显示第一条，不做形变
  if (reduced.value) {
    started = true
    firstRender()
    return
  }

  firstRender()

  if (rootRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true
        syncVisibility()
      },
      { rootMargin: '80px' },
    )
    observer.observe(rootRef.value)
  }

  document.addEventListener('visibilitychange', syncVisibility)

  if (ready.value) {
    start()
    return
  }

  const stopWatch = watch(ready, (value) => {
    if (!value) return
    start()
    stopWatch()
  })
})

onBeforeUnmount(() => {
  started = false
  stopLoop()
  observer?.disconnect()
  observer = null
  document.removeEventListener('visibilitychange', syncVisibility)
})
</script>

<template>
  <div
    ref="rootRef"
    class="morphing-text"
    :class="props.class"
  >
    <span ref="text1Ref" :class="SLOT_CLASS" />
    <span ref="text2Ref" :class="SLOT_CLASS" />

    <svg
      id="morphing-text-filters"
      width="0"
      height="0"
      class="morphing-text-filters"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter :id="FILTER_ID">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.morphing-text {
  position: relative;
  margin-inline: auto;
  width: 100%;
  height: 4rem;
  max-width: 42rem;
  overflow: hidden;
  text-align: center;
  font-weight: 700;
  line-height: 1;
  font-size: 40pt;
  /* 阈值滤镜把模糊文字压成硬边，形成「融化再凝结」的形变观感 */
  filter: url(#morphing-text-threshold) blur(0.6px);
}

.morphing-text-filters {
  position: fixed;
  width: 0;
  height: 0;
  overflow: hidden;
}

@media (min-width: 48rem) {
  .morphing-text {
    height: 6rem;
  }
}

@media (min-width: 64rem) {
  .morphing-text {
    font-size: 6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .morphing-text {
    filter: none;
  }
}
</style>
