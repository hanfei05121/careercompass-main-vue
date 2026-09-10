<script setup lang="ts">
/**
 * BootLoader —— 启动遮罩。
 *
 * 逐项对齐参考站点的 MultiStepLoader + AppBootLoader：
 * - 五条载入文案，列表随进度整体上移（`translateY(-(current * 40)px)`），
 *   非当前项的透明度按 `max(1 - |r - current| * 0.2, 0)` 衰减
 * - 图标三态：已完成 → primary 对号；进行中 → primary 旋转图标；未开始 → foreground/50 圆圈
 * - 每步最短 420ms，并等待真实信号（字体就绪 / 丝绸着色器编译 / 粒子层构建），
 *   单步最多 4000ms，整体 8s 兜底
 * - 背景是 12 圈同心涟漪，尺寸按视口推导（参考站点客户端算法）
 * - 结束时把 <html> 从 booting 切到 booted，并放行首屏入场动画
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { nextFrame, useSiteReady, waitForFonts, waitForSignal } from '@/composables/useSiteReady'

const STEPS = [
  '载入字体与视觉系统',
  '预热 GPU 与丝绸着色器',
  '编译三维光轨引擎',
  '缓存图像与粒子层',
  '同步交互层',
]

/** 每步最短停留（毫秒） */
const STEP_DURATION = 420
/** 每步上限（参考站点取 max(duration + 2500, 4000)） */
const STEP_TIMEOUT = 4000
/** 最后一步打勾后的停留 */
const COMPLETE_HOLD = 520
/** 整体兜底：8s 后无论如何都要放行 */
const GUARD_TIMEOUT = 8000
/** 淡出时长，需与 .boot-fade-leave-active 一致 */
const FADE_OUT = 420

const { silkReady, particlesReady, markSiteReady } = useSiteReady()
const { reduced } = useReducedMotion()

const visible = ref(true)
const current = ref(0)
const complete = ref(false)

/** 涟漪同心圆的尺寸推导（对齐参考站点在客户端算出的 base / space） */
const viewport = ref({ w: 1920, h: 1080 })

const ripple = computed(() => {
  const w = viewport.value.w || 1920
  const h = viewport.value.h || 1080
  const minSide = Math.min(w, h) * 0.28
  const space = (Math.hypot(w, h) * 1.12 - minSide) / 11
  return {
    base: minSide - space,
    space,
    opacityStep: 0.215 / 12,
    count: 12,
    waveSpeed: 90,
  }
})

const rings = computed(() =>
  Array.from({ length: ripple.value.count }, (_, index) => ({
    size: Math.max(0, ripple.value.base + index * ripple.value.space),
    opacity: Math.max(0, 0.24 - index * ripple.value.opacityStep),
    delay: index * ripple.value.waveSpeed,
    dashed: index === ripple.value.count - 1,
  })),
)

function rowStyle(index: number) {
  return {
    opacity: index === current.value ? 1 : Math.max(1 - Math.abs(index - current.value) * 0.2, 0),
    transform: `translateY(${-(current.value * 40)}px)`,
  }
}

/** 该步是否已完成（最后一步要等 complete 才打勾） */
function isDone(index: number) {
  return index < current.value || (index === STEPS.length - 1 && index === current.value && complete.value)
}

/** 该步是否进行中 */
function isActive(index: number) {
  return index === current.value && (!complete.value || index !== STEPS.length - 1)
}

let runId = 0
let cancelled = false
let guardTimer: number | null = null

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

function runStepAction(index: number): Promise<void> {
  switch (index) {
    case 0:
      return waitForFonts(3000)
    case 1:
      return waitForSignal(silkReady, 2500)
    case 3:
      return waitForSignal(particlesReady, 2000)
    case 4:
      return nextFrame()
    default:
      // 「编译三维光轨引擎」与丝绸着色器同步完成
      return Promise.resolve()
  }
}

async function runStep(index: number) {
  if (cancelled) return
  const id = ++runId

  // 动作与最短时长并行，动作再慢也不会超过 STEP_TIMEOUT
  const action = Promise.race([runStepAction(index), sleep(STEP_TIMEOUT)])
  await Promise.all([sleep(STEP_DURATION), action])
  if (cancelled || id !== runId) return

  await nextFrame()
  if (cancelled || id !== runId) return

  await advance()
}

async function advance() {
  if (cancelled) return

  if (current.value < STEPS.length - 1) {
    current.value += 1
    await runStep(current.value)
    return
  }

  complete.value = true
  await sleep(COMPLETE_HOLD)
  if (cancelled) return
  await finish()
}

async function finish() {
  if (!visible.value) return

  if (guardTimer !== null) {
    window.clearTimeout(guardTimer)
    guardTimer = null
  }

  visible.value = false

  const root = document.documentElement
  root.classList.add('booted')
  root.classList.remove('booting')
  markSiteReady()

  await sleep(FADE_OUT)
  root.classList.remove('booted')
}

function onResize() {
  viewport.value = { w: window.innerWidth, h: window.innerHeight }
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)

  // 减少动效：直接放行，不播序列
  if (reduced.value) {
    void finish()
    return
  }

  guardTimer = window.setTimeout(() => {
    void finish()
  }, GUARD_TIMEOUT)

  void runStep(0)
})

onBeforeUnmount(() => {
  cancelled = true
  window.removeEventListener('resize', onResize)
  if (guardTimer !== null) window.clearTimeout(guardTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="boot-fade">
      <div
        v-if="visible"
        data-theme-burn="loader"
        role="status"
        aria-live="polite"
      >
        <!-- 背景同心涟漪 -->
        <div class="boot-ripples" aria-hidden="true">
          <div
            v-for="(ring, i) in rings"
            :key="i"
            class="animate-ripple-circle border-black/15 bg-black/[0.02] shadow-xl dark:border-white/15 dark:bg-white/[0.02]"
            :style="{
              width: `${ring.size}px`,
              height: `${ring.size}px`,
              opacity: ring.opacity,
              animationDelay: `${ring.delay}ms`,
              borderStyle: ring.dashed ? 'dashed' : 'solid',
            }"
          />
        </div>

        <div class="boot-loader-panel">
          <div class="boot-loader-list">
            <div
              v-for="(step, index) in STEPS"
              :key="step"
              class="mb-4 flex items-center gap-2 text-left transition-[opacity,transform] duration-300 ease-silk"
              :style="rowStyle(index)"
            >
              <!-- 已完成：对号 -->
              <svg
                v-if="isDone(index)"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6 shrink-0 text-primary"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clip-rule="evenodd"
                />
              </svg>

              <!-- 进行中：旋转 -->
              <svg
                v-else-if="isActive(index)"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="boot-loader-spinner size-6 shrink-0 text-primary"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                  clip-rule="evenodd"
                />
              </svg>

              <!-- 未开始：空心圆 -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6 shrink-0 text-foreground/50"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

              <span
                class="boot-loader-text text-lg text-foreground"
                :class="index > current ? 'opacity-50' : ''"
              >
                {{ step }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.boot-ripples {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  user-select: none;
}

.boot-fade-leave-active {
  transition: opacity 0.42s ease;
}

.boot-fade-leave-to {
  opacity: 0;
}
</style>
