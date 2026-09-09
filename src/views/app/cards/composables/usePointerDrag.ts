import { onBeforeUnmount, ref } from 'vue'

/**
 * 指针拖拽（鼠标 / 触屏统一处理）
 * 用法：在容器上绑定 onPointerDown，实时位移通过 dx / dy 读取，
 * 松手后通过 onRelease 拿到位移与速度，由调用方决定是切换还是回弹。
 */

export type DragAxis = 'x' | 'y' | 'both'

export interface DragPayload {
  dx: number
  dy: number
}

export interface ReleasePayload extends DragPayload {
  /** 水平速度 px/ms（正为向右） */
  velocityX: number
  /** 垂直速度 px/ms（正为向下） */
  velocityY: number
}

export interface UsePointerDragOptions {
  /** 允许的拖拽方向，默认 both */
  axis?: DragAxis
  /** 拖动中的实时回调 */
  onMove?: (payload: DragPayload) => void
  /** 松手回调：位移与速度 */
  onRelease?: (payload: ReleasePayload) => void
}

export const usePointerDrag = (options: UsePointerDragOptions = {}) => {
  const { axis = 'both', onMove, onRelease } = options

  const dx = ref(0)
  const dy = ref(0)
  const dragging = ref(false)

  let startX = 0
  let startY = 0
  let lastX = 0
  let lastY = 0
  let lastTime = 0
  let velocityX = 0
  let velocityY = 0
  let activePointer: number | null = null

  const handleMove = (event: PointerEvent) => {
    if (!dragging.value) return
    if (activePointer !== null && event.pointerId !== activePointer) return

    const rawX = event.clientX - startX
    const rawY = event.clientY - startY
    dx.value = axis === 'y' ? 0 : rawX
    dy.value = axis === 'x' ? 0 : rawY

    const now = event.timeStamp || performance.now()
    const elapsed = now - lastTime
    if (elapsed > 0) {
      velocityX = (event.clientX - lastX) / elapsed
      velocityY = (event.clientY - lastY) / elapsed
    }
    lastX = event.clientX
    lastY = event.clientY
    lastTime = now

    onMove?.({ dx: dx.value, dy: dy.value })
  }

  const removeListeners = () => {
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', handleUp)
    window.removeEventListener('pointercancel', handleUp)
  }

  const handleUp = () => {
    if (!dragging.value) return
    dragging.value = false
    const payload: ReleasePayload = {
      dx: dx.value,
      dy: dy.value,
      velocityX,
      velocityY,
    }
    dx.value = 0
    dy.value = 0
    activePointer = null
    removeListeners()
    onRelease?.(payload)
  }

  const onPointerDown = (event: PointerEvent) => {
    dragging.value = true
    activePointer = event.pointerId
    startX = event.clientX
    startY = event.clientY
    lastX = event.clientX
    lastY = event.clientY
    lastTime = event.timeStamp || performance.now()
    velocityX = 0
    velocityY = 0
    dx.value = 0
    dy.value = 0
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
  }

  onBeforeUnmount(removeListeners)

  return { dx, dy, dragging, onPointerDown }
}
