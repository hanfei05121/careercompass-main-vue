import { readonly, ref } from 'vue'

/**
 * 全站「首屏就绪」状态与各启动阶段信号。
 *
 * 启动遮罩按参考站点的做法分步等待真实信号（字体 / 丝绸着色器 / 粒子层），
 * 全部就绪后才置 `siteReady`，首屏的 BlurReveal 才入场。
 */
const siteReady = ref(false)
/** 丝绸 WebGL 着色器编译完成 */
const silkReady = ref(false)
/** 粒子层构建完成 */
const particlesReady = ref(false)

/** 启动遮罩最长停留时间（毫秒）；超时也会置为就绪，避免动画异常导致页面永久隐藏 */
let fallbackTimer: number | null = null

export function useSiteReady() {
  function markSiteReady() {
    if (siteReady.value) return
    siteReady.value = true
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
  }

  /** 兜底：即使遮罩组件未挂载，也会在延迟后强制放行 */
  function armFallback(delay = 2000) {
    if (fallbackTimer !== null || siteReady.value) return
    fallbackTimer = window.setTimeout(markSiteReady, delay)
  }

  function markSilkReady() {
    silkReady.value = true
  }

  function markParticlesReady() {
    particlesReady.value = true
  }

  return {
    ready: readonly(siteReady),
    silkReady: readonly(silkReady),
    particlesReady: readonly(particlesReady),
    markSiteReady,
    markSilkReady,
    markParticlesReady,
    armFallback,
  }
}

/** 等待一个 ready 信号，带超时兜底（参考站点的 waitFor） */
export function waitForSignal(
  source: { value: boolean },
  timeout = 3000,
): Promise<void> {
  if (source.value) return Promise.resolve()
  return new Promise((resolve) => {
    const started = Date.now()
    const timer = window.setInterval(() => {
      if (source.value || Date.now() - started >= timeout) {
        window.clearInterval(timer)
        resolve()
      }
    }, 40)
  })
}

/** 等待字体系统就绪 */
export function waitForFonts(timeout = 3000): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  if (!fonts) return Promise.resolve()
  return Promise.race([
    fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
  ])
}

/** 等一帧 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}
