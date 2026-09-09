<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 10. 过冲滑入（会多滑一点）
 * 新卡片从一侧滑入，冲过中线一点后再回弹到正中，弹性明显。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)
/** 1 从右侧进（下一张），-1 从左侧进（上一张） */
const dir = ref<1 | -1>(1)
const exiting = ref<DeckCard | null>(null)
const animating = ref(false)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    const passed = Math.abs(offsetX) > 90 || Math.abs(velocityX) > 0.45
    if (!passed) return
    go(offsetX < 0 ? 1 : -1)
  },
})

const go = (d: 1 | -1) => {
  if (animating.value) return
  animating.value = true
  dir.value = d
  exiting.value = props.cards[index.value]
  index.value = (index.value + d + total.value) % total.value
  window.setTimeout(() => {
    exiting.value = null
    animating.value = false
  }, 640)
}

const currentCard = computed(() => props.cards[index.value])

const currentStyle = computed(() => {
  if (dragging.value) {
    return { transform: `translate3d(${dx.value}px, 0, 0)`, transition: 'none' }
  }
  return { transform: 'translate3d(0, 0, 0)' }
})

defineExpose({
  next: () => go(1),
  prev: () => go(-1),
})
</script>

<template>
  <div
    class="relative h-full w-full touch-none select-none overflow-hidden"
    @pointerdown="onPointerDown"
  >
    <div
      v-if="exiting"
      :key="`out-${exiting.id}`"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px]"
      :class="dir === 1 ? 'slide-out-left' : 'slide-out-right'"
    >
      <DeckCardFace :card="exiting" :index="exiting.id" :total="total" />
    </div>

    <div
      :key="`in-${currentCard.id}`"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px] cursor-grab active:cursor-grabbing"
      :class="animating ? (dir === 1 ? 'overshoot-right' : 'overshoot-left') : ''"
      :style="currentStyle"
    >
      <DeckCardFace :card="currentCard" :index="currentCard.id" :total="total" />
    </div>
  </div>
</template>

<style scoped>
.overshoot-right {
  animation: overshoot-right 0.62s cubic-bezier(0.22, 1, 0.36, 1);
}

.overshoot-left {
  animation: overshoot-left 0.62s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-out-left {
  animation: slide-out-left 0.62s cubic-bezier(0.4, 0, 0.7, 0.2) forwards;
}

.slide-out-right {
  animation: slide-out-right 0.62s cubic-bezier(0.4, 0, 0.7, 0.2) forwards;
}

@keyframes overshoot-right {
  0% {
    transform: translate3d(112%, 0, 0) rotate(5deg);
  }
  62% {
    transform: translate3d(-14%, 0, 0) rotate(-1.5deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes overshoot-left {
  0% {
    transform: translate3d(-112%, 0, 0) rotate(-5deg);
  }
  62% {
    transform: translate3d(14%, 0, 0) rotate(1.5deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes slide-out-left {
  to {
    transform: translate3d(-118%, 0, 0) rotate(-10deg);
    opacity: 0;
  }
}

@keyframes slide-out-right {
  to {
    transform: translate3d(118%, 0, 0) rotate(10deg);
    opacity: 0;
  }
}
</style>
