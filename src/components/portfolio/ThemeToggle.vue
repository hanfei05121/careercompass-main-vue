<script setup lang="ts">
/**
 * ThemeToggle —— 明暗主题切换。
 * 对齐参考站点：点击后以按钮为圆心做圆形揭示（View Transition API），
 * 浏览器不支持时直接切换。图标为 Phosphor 风格的 duotone 太阳 / 月亮。
 */
import { onBeforeUnmount, ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const props = withDefaults(
  defineProps<{
    /** 过渡时长（毫秒） */
    duration?: number
    /** 是否从屏幕中心扩散（默认以按钮为中心） */
    fromCenter?: boolean
  }>(),
  { duration: 400, fromCenter: false },
)

const { isDark, setMode } = useTheme()

type ViewTransitionLike = {
  finished: Promise<void>
  ready: Promise<void>
}

const buttonRef = ref<HTMLButtonElement | null>(null)
const busy = ref(false)
let animation: Animation | null = null

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`
}

/** 生成 clip-path 关键帧：从 0 半径扩散到覆盖屏幕的圆 */
function clipFrames(cx: number, cy: number, radius: number, w: number, h: number) {
  const center = `${toPercent(cx, w)} ${toPercent(cy, h)}`
  const maxRadius = (radius / (Math.hypot(w, h) / Math.SQRT2)) * 100
  return [`circle(0% at ${center})`, `circle(${maxRadius}% at ${center})`]
}

function cleanup() {
  busy.value = false
  const root = document.documentElement
  delete root.dataset.themeVt
  root.style.removeProperty('--theme-toggle-vt-duration')
  root.style.removeProperty('--theme-vt-clip-from')
  animation?.cancel()
  animation = null
}

function toggle() {
  const button = buttonRef.value
  if (!button || busy.value || document.documentElement.dataset.themeVt) return

  const next = isDark.value ? 'light' : 'dark'
  // 变浅 = 光线扩散；变深 = 光线收拢
  const kind = next === 'light' ? 'expand' : 'collapse'

  const apply = () => setMode(next)

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => ViewTransitionLike
  }

  if (typeof doc.startViewTransition !== 'function') {
    apply()
    return
  }

  const w = window.innerWidth
  const h = window.innerHeight
  let cx: number
  let cy: number

  if (props.fromCenter) {
    cx = w / 2
    cy = h / 2
  } else {
    const rect = button.getBoundingClientRect()
    cx = rect.left + rect.width / 2
    cy = rect.top + rect.height / 2
  }

  const radius = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy))
  const [from, to] = clipFrames(cx, cy, radius, w, h)
  const frames = kind === 'expand' ? [from, to] : [to, from]

  const root = document.documentElement
  root.dataset.themeVt = kind
  root.style.setProperty('--theme-toggle-vt-duration', `${props.duration}ms`)
  root.style.setProperty('--theme-vt-clip-from', frames[0])
  busy.value = true

  const transition = doc.startViewTransition(apply)
  transition.finished.finally(cleanup).catch(() => {})
  transition.ready
    .then(() => {
      const pseudoElement =
        kind === 'expand' ? '::view-transition-new(root)' : '::view-transition-old(root)'
      animation = root.animate(
        { clipPath: frames } as unknown as PropertyIndexedKeyframes,
        {
          duration: props.duration,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement,
        } as unknown as KeyframeAnimationOptions,
      )
    })
    .catch(() => {})
}

onBeforeUnmount(cleanup)
</script>

<template>
  <button
    ref="buttonRef"
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? '切换浅色主题' : '切换暗色主题'"
    :disabled="busy"
    @click="toggle"
  >
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <g>
        <path d="M184,128a56,56,0,1,1-56-56A56,56,0,0,1,184,128Z" opacity="0.2" />
        <path
          d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"
        />
      </g>
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <g>
        <path d="M227.89,147.89A96,96,0,1,1,108.11,28.11,96.09,96.09,0,0,0,227.89,147.89Z" opacity="0.2" />
        <path
          d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"
        />
      </g>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition:
    background-color 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.theme-toggle:hover {
  background: color-mix(in oklch, hsl(var(--accent)) 70%, transparent);
  color: hsl(var(--foreground));
}

.theme-toggle:disabled {
  opacity: 0.6;
}
</style>
