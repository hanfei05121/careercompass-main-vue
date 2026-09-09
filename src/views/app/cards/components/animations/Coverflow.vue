<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 2. 封面流（两边会透视）
 * 中间卡片最大，左右两侧卡片向外立起，形成翻书般的空间透视。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    let delta = -offsetX / 240
    if (Math.abs(velocityX) > 0.5) delta += velocityX > 0 ? -0.7 : 0.7
    const next = Math.round(index.value + delta)
    index.value = ((next % total.value) + total.value) % total.value
  },
})

/** 连续位置：拖动过程中为小数，松手后归整 */
const pos = computed(() => index.value + (dragging.value ? -dx.value / 240 : 0))

/** 环形最短路径偏移，循环翻页时卡片从最近的一侧进出 */
const relOffset = (i: number) => {
  const n = total.value
  let d = i - pos.value
  while (d > n / 2) d -= n
  while (d < -n / 2) d += n
  return d
}

const cardStyle = (i: number) => {
  const offset = relOffset(i)
  const abs = Math.abs(offset)
  const sign = offset >= 0 ? 1 : -1
  const rotateY = -sign * 52 * Math.min(abs, 1)
  return {
    transform: `translateX(${offset * 54}%) translateZ(${-abs * 150}px) rotateY(${rotateY}deg) scale(${1 - abs * 0.04})`,
    opacity: `${Math.max(0, 1 - abs * 0.28)}`,
    zIndex: `${100 - Math.round(abs * 10)}`,
    visibility: (abs > 2.6 ? 'hidden' : 'visible') as 'hidden' | 'visible',
    transition: dragging.value
      ? 'none'
      : 'transform .5s cubic-bezier(.22,1,.36,1), opacity .5s ease',
  }
}

defineExpose({
  next: () => (index.value = (index.value + 1) % total.value),
  prev: () => (index.value = (index.value - 1 + total.value) % total.value),
})
</script>

<template>
  <div
    class="relative h-full w-full touch-none select-none"
    style="perspective: 1200px"
    @pointerdown="onPointerDown"
  >
    <div class="absolute inset-0" style="transform-style: preserve-3d">
      <div
        v-for="(card, i) in cards"
        :key="card.id"
        class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px]"
        :style="cardStyle(i)"
      >
        <DeckCardFace :card="card" :index="card.id" :total="total" />
      </div>
    </div>
  </div>
</template>
