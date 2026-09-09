<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 6. 纵向滚轮（上下拨着换）
 * 卡片像滚轮一样上下滚动，正对用户的卡片最大，上下卡片向后弯曲。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)

const { dy, dragging, onPointerDown } = usePointerDrag({
  axis: 'y',
  onRelease: ({ dy: offsetY, velocityY }) => {
    let delta = -offsetY / 200
    if (Math.abs(velocityY) > 0.5) delta += velocityY > 0 ? -0.7 : 0.7
    const next = Math.round(index.value + delta)
    index.value = ((next % total.value) + total.value) % total.value
  },
})

const pos = computed(() => index.value + (dragging.value ? -dy.value / 200 : 0))

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
  return {
    transform: `translateY(${offset * 112}px) rotateX(${-offset * 26}deg) translateZ(${-abs * 130}px) scale(${1 - abs * 0.06})`,
    opacity: `${Math.max(0, 1 - abs * 0.3)}`,
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
    style="perspective: 1100px"
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
