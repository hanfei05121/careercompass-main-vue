import { computed, ref } from 'vue'

/** 站点配色模式，默认暗色（与参考站点 Karot 一致） */
export type ColorMode = 'dark' | 'light'

const STORAGE_KEY = 'Karot-color-mode'

/** 品牌底色：与 index.html 的首屏启动脚本保持一致，避免切换时闪色 */
const SHELL_BG: Record<ColorMode, string> = {
  dark: '#1a1520',
  light: '#f7dce6',
}

function readStored(): ColorMode {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* 隐私模式下 localStorage 不可用，回落暗色 */
  }
  return 'dark'
}

const mode = ref<ColorMode>(readStored())
let initialized = false

/** 把模式写到 <html> 上：类名 + colorScheme + 底色，供 CSS 变量与滚动条同步 */
function apply(next: ColorMode) {
  const el = document.documentElement
  const isDark = next === 'dark'
  el.classList.toggle('dark', isDark)
  el.classList.toggle('light', !isDark)
  el.style.colorScheme = next
  el.style.backgroundColor = SHELL_BG[next]
  document.body.style.backgroundColor = SHELL_BG[next]
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', next)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', SHELL_BG[next])
}

/**
 * 全站配色模式。首次调用时同步一次 DOM，
 * 之后主题切换由 ThemeToggle 负责（含圆形揭示过渡动画）。
 */
export function useTheme() {
  if (!initialized) {
    apply(mode.value)
    initialized = true
  }

  function setMode(next: ColorMode) {
    mode.value = next
    apply(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* 忽略写入失败 */
    }
  }

  return {
    mode,
    isDark: computed(() => mode.value === 'dark'),
    setMode,
  }
}
