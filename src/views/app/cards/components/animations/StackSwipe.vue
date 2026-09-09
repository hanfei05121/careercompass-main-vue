<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 1. 层叠滑走（顶卡飞出去）
 * 顶部卡片带着旋转滑出画面，下一张从下方顶上来并对齐回弹。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)
/** 0 静止；-1 向左飞出（下一张）；1 向右飞出（上一张） */
const flying = ref<0 | 1 | -1>(0)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    const passed = Math.abs(offsetX) > 90 || Math.abs(velocityX) > 0.45
    if (!passed) return
    fly(offsetX < 0 ? -1 : 1)
  },
})

const fly = (dir: 1 | -1) => {
  if (flying.value !== 0) return
  flying.value = dir
  window.setTimeout(() => {
    index.value = (index.value + (dir === -1 ? 1 : -1) + total.value) % total.value
    flying.value = 0
  }, 420)
}

const topCard = computed(() => props.cards[index.value])
const backCards = computed(() =>
  [1, 2].map((depth) => ({
    depth,
    card: props.cards[(index.value + depth) % total.value],
  }))
)

const topStyle = computed(() => {
  if (flying.value !== 0) {
    return {
      transform: `translate3d(${flying.value * 640}px, ${flying.value * 70}px, 0) rotate(${flying.value * 34}deg)`,
      opacity: '0',
      transition: 'transform .42s cubic-bezier(.4,0,.7,-0.15), opacity .42s linear',
    }
  }
  if (dragging.value) {
    return {
      transform: `translate3d(${dx.value}px, 0, 0) rotate(${dx.value / 14}deg)`,
      transition: 'none',
    }
  }
  return {
    transform: 'translate3d(0, 0, 0) rotate(0deg)',
    transition: 'transform .34s cubic-bezier(.34,1.45,.64,1)',
  }
})

const backStyle = (depth: number) => ({
  transform: `translate3d(0, ${depth * 16}px, 0) scale(${1 - depth * 0.045})`,
  opacity: `${1 - depth * 0.16}`,
  zIndex: `${10 - depth}`,
  transition: 'transform .34s cubic-bezier(.34,1.45,.64,1), opacity .34s linear',
})

defineExpose({
  next: () => fly(-1),
  prev: () => fly(1),
})
</script>

<template>
  <div class="relative h-full w-full touch-none select-none" @pointerdown="onPointerDown">
    <div
      v-for="item in backCards"
      :key="`back-${item.card.id}`"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px]"
      :style="backStyle(item.depth)"
    >
      <DeckCardFace :card="item.card" :index="item.card.id" :total="total" />
    </div>

    <div
      class="absolute left-1/2 top-1/2 z-20 -ml-[120px] -mt-[160px] h-[320px] w-[240px] cursor-grab active:cursor-grabbing"
      :style="topStyle"
    >
      <div :key="topCard.id" class="h-full w-full pop-in">
        <DeckCardFace :card="topCard" :index="topCard.id" :total="total" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pop-in {
  animation: pop-in 0.34s cubic-bezier(0.34, 1.45, 0.64, 1);
}

@keyframes pop-in {
  from {
    transform: translate3d(0, 26px, 0) scale(0.92);
  }
  to {
    transform: translate3d(0, 0, 0) scale(1);
  }
}
</style>
