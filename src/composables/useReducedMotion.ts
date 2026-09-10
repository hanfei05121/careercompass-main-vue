import { onMounted, onUnmounted, ref } from 'vue'

const QUERY = '(prefers-reduced-motion: reduce)'

/** 系统「减少动效」偏好，组件据此降级为静态表现 */
export function useReducedMotion() {
  const reduced = ref(false)
  const mql = typeof window !== 'undefined' ? window.matchMedia(QUERY) : null

  function sync() {
    reduced.value = mql ? mql.matches : false
  }

  onMounted(() => {
    sync()
    mql?.addEventListener('change', sync)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', sync)
  })

  return { reduced }
}
