<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component, ComponentPublicInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Shuffle,
} from 'lucide-vue-next'
import StackSwipe from './components/animations/StackSwipe.vue'
import Coverflow from './components/animations/Coverflow.vue'
import SnapCarousel from './components/animations/SnapCarousel.vue'
import FanSpread from './components/animations/FanSpread.vue'
import FlipSwipe from './components/animations/FlipSwipe.vue'
import WheelScroll from './components/animations/WheelScroll.vue'
import CubeRotate from './components/animations/CubeRotate.vue'
import PeekSide from './components/animations/PeekSide.vue'
import ExplodeGather from './components/animations/ExplodeGather.vue'
import OvershootSlide from './components/animations/OvershootSlide.vue'
import {
  CARD_ANIMATIONS,
  DECK_CARDS,
  findAnimation,
  type CardAnimationType,
} from './types'

/** 动画类型 → 演示组件 */
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

const route = useRoute()
const router = useRouter()

const type = computed(() => String(route.params.type ?? ''))
const meta = computed(() => findAnimation(type.value))
const currentComponent = computed<Component | null>(
  () => COMPONENTS[type.value as CardAnimationType] ?? null
)
const order = computed(() => CARD_ANIMATIONS.findIndex((item) => item.type === type.value) + 1)

const stageRef = ref<ComponentPublicInstance | null>(null)

/** 调用子组件暴露的切换方法 */
const trigger = (method: 'next' | 'prev') => {
  const instance = stageRef.value as
    | (ComponentPublicInstance & { next?: () => void; prev?: () => void })
    | null
  instance?.[method]?.()
}

/** 在 10 种动效之间切换 */
const goAnimation = (step: 1 | -1) => {
  const current = CARD_ANIMATIONS.findIndex((item) => item.type === type.value)
  if (current < 0) return
  const nextIndex = (current + step + CARD_ANIMATIONS.length) % CARD_ANIMATIONS.length
  router.push(`/cards/${CARD_ANIMATIONS[nextIndex].type}`)
}

const autoPlay = ref(false)
let timer: number | null = null

const stopAuto = () => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

const startAuto = () => {
  stopAuto()
  timer = window.setInterval(() => trigger('next'), 1800)
}

const toggleAuto = () => {
  autoPlay.value = !autoPlay.value
}

watch(autoPlay, (value) => (value ? startAuto() : stopAuto()))
// 切换动效时重置自动播放，避免定时器残留
watch(type, () => {
  autoPlay.value = false
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') trigger('prev')
  else if (event.key === 'ArrowRight') trigger('next')
  else if (event.code === 'Space') {
    event.preventDefault()
    toggleAuto()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopAuto()
})
</script>

<template>
  <div class="container mx-auto space-y-6">
    <template v-if="meta && currentComponent">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            class="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            @click="router.push('/cards')"
          >
            <ArrowLeft class="h-4 w-4" />
            卡片动效
          </button>
          <h1 class="page-title">
            {{ meta.name }}
            <span class="ml-2 text-base font-normal text-muted-foreground">
              {{ meta.enName }}
            </span>
          </h1>
          <p class="page-subtitle mt-1 max-w-2xl">{{ meta.action }}</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            @click="goAnimation(-1)"
          >
            <ChevronLeft class="h-4 w-4" />
            上一个动效
          </button>
          <span class="px-1 text-sm text-muted-foreground">
            {{ order }} / {{ CARD_ANIMATIONS.length }}
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            @click="goAnimation(1)"
          >
            下一个动效
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- 演示舞台 -->
      <div
        class="relative flex h-[440px] items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-muted/30"
      >
        <div class="absolute -left-16 top-10 h-52 w-52 rounded-full bg-primary/10 blur-2xl" />
        <div class="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-primary/5 blur-2xl" />

        <div class="relative h-full w-full max-w-[720px]">
          <component :is="currentComponent" :key="type" ref="stageRef" :cards="DECK_CARDS" />
        </div>

        <p
          class="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground"
        >
          按住卡片拖动即可切换，也可用下方按钮或键盘 ← → ，空格键自动播放
        </p>
      </div>

      <!-- 控制条 -->
      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm transition-colors hover:bg-muted"
          @click="trigger('prev')"
        >
          <ChevronLeft class="h-4 w-4" />
          上一张
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm transition-colors hover:bg-muted"
          @click="trigger('next')"
        >
          下一张
          <ChevronRight class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm transition-colors hover:bg-muted"
          @click="toggleAuto"
        >
          <Pause v-if="autoPlay" class="h-4 w-4" />
          <Play v-else class="h-4 w-4" />
          {{ autoPlay ? '暂停播放' : '自动播放' }}
        </button>
      </div>

      <div class="rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-sm font-medium">视觉特点</p>
        <p class="mt-1 text-sm text-muted-foreground">{{ meta.visual }}</p>
        <p class="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shuffle class="h-3.5 w-3.5" />
          共 {{ DECK_CARDS.length }} 张演示卡片，首尾循环
        </p>
      </div>
    </template>

    <div v-else class="rounded-2xl border border-border/60 bg-card p-10 text-center">
      <p class="text-lg font-medium">没有找到这个动效</p>
      <p class="mt-1 text-sm text-muted-foreground">它可能已被移除，或链接拼写有误。</p>
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm transition-colors hover:bg-muted"
        @click="router.push('/cards')"
      >
        <ArrowLeft class="h-4 w-4" />
        返回动效列表
      </button>
    </div>
  </div>
</template>
