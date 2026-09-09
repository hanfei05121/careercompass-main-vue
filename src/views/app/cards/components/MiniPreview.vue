<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Component, ComponentPublicInstance } from 'vue'
import StackSwipe from './animations/StackSwipe.vue'
import Coverflow from './animations/Coverflow.vue'
import SnapCarousel from './animations/SnapCarousel.vue'
import FanSpread from './animations/FanSpread.vue'
import FlipSwipe from './animations/FlipSwipe.vue'
import WheelScroll from './animations/WheelScroll.vue'
import CubeRotate from './animations/CubeRotate.vue'
import PeekSide from './animations/PeekSide.vue'
import ExplodeGather from './animations/ExplodeGather.vue'
import OvershootSlide from './animations/OvershootSlide.vue'
import { DECK_CARDS, type CardAnimationType } from '../types'

/** 列表封面用的迷你预览：嵌入真实动画组件，缩小后自动轮播 */
const props = defineProps<{ type: CardAnimationType }>()

const COMPONENTS: Record<CardAnimationType, Component> = {
  'stack-swipe': StackSwipe,
  coverflow: Coverflow,
  'snap-carousel': SnapCarousel,
  'fan-spread': FanSpread,
  'flip-swipe': FlipSwipe,
  'wheel-scroll': WheelScroll,
  'cube-rotate': CubeRotate,
  'peek-side': PeekSide,
  'explode-gather': ExplodeGather,
  'overshoot-slide': OvershootSlide,
}

const currentComponent = computed(() => COMPONENTS[props.type])

const stageRef = ref<ComponentPublicInstance | null>(null)
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    const instance = stageRef.value as
      | (ComponentPublicInstance & { next?: () => void })
      | null
    instance?.next?.()
  }, 1800)
})

onBeforeUnmount(() => {
  if (timer !== null) window.clearInterval(timer)
})
</script>

<template>
  <div class="pointer-events-none relative h-full w-full overflow-hidden">
    <!-- 400x400 的标准舞台缩放到容器内，保证与详情页一致的动作比例 -->
    <div
      class="absolute left-1/2 top-1/2 h-[400px] w-[400px]"
      style="transform: translate(-50%, -50%) scale(0.4)"
    >
      <component :is="currentComponent" :key="type" ref="stageRef" :cards="DECK_CARDS" />
    </div>
  </div>
</template>
