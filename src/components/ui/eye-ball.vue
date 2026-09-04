<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  /** 眼球（眼白）直径（px） */
  size?: number
  /** 瞳孔直径（px） */
  pupilSize?: number
  /** 瞳孔相对眼球中心的最大偏移距离（px） */
  maxDistance?: number
  /** 眼白颜色 */
  eyeColor?: string
  /** 瞳孔颜色 */
  pupilColor?: string
  /** 是否闭眼（闭眼时眼球压成一条 2px 的线） */
  isBlinking?: boolean
  /** 强制注视方向 X（有值时忽略鼠标跟随） */
  forceLookX?: number
  /** 强制注视方向 Y（有值时忽略鼠标跟随） */
  forceLookY?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  pupilSize: 16,
  maxDistance: 10,
  eyeColor: 'white',
  pupilColor: 'black',
  isBlinking: false,
})

const mouseX = ref(0)
const mouseY = ref(0)
const eyeRef = ref<HTMLDivElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

const pupilPosition = computed(() => {
  // 强制注视方向优先于鼠标跟随（与原版 React 实现一致）
  if (props.forceLookX !== undefined && props.forceLookY !== undefined) {
    return { x: props.forceLookX, y: props.forceLookY }
  }

  const el = eyeRef.value
  if (!el) return { x: 0, y: 0 }

  const eye = el.getBoundingClientRect()
  const eyeCenterX = eye.left + eye.width / 2
  const eyeCenterY = eye.top + eye.height / 2

  const deltaX = mouseX.value - eyeCenterX
  const deltaY = mouseY.value - eyeCenterY
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), props.maxDistance)

  const angle = Math.atan2(deltaY, deltaX)
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  }
})

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div
    ref="eyeRef"
    class="rounded-full flex items-center justify-center transition-all duration-150"
    :style="{
      width: `${size}px`,
      height: isBlinking ? '2px' : `${size}px`,
      backgroundColor: eyeColor,
      overflow: 'hidden',
    }"
  >
    <div
      v-if="!isBlinking"
      class="rounded-full"
      :style="{
        width: `${pupilSize}px`,
        height: `${pupilSize}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }"
    />
  </div>
</template>
