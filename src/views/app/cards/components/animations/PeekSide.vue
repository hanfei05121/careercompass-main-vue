<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 8. 侧边窥视（后面的探出来）
 * 后面的卡片只从侧边探出一小部分，滑到画面中间时才完全展开。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    let delta = -offsetX / 180
    if (Math.abs(velocityX) > 0.5) delta += velocityX > 0 ? -0.7 : 0.7
    const next = Math.round(index.value + delta)
    index.value = ((next % total.value) + total.value) % total.value
  },
})

const pos = computed(() => index.value + (dragging.value ? -dx.value / 180 : 0))

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
  // 间距刻意小于卡片宽度，后面的卡只露出侧边一截
  const isCenter = abs < 0.5
  return {
    transform: `translateX(${offset * 62}px) translateZ(${-abs * 90}px) scale(${isCenter ? 1 : 0.84})`,
    opacity: `${Math.max(0.25, 1 - abs * 0.32)}`,
    zIndex: `${100 - Math.round(abs * 10)}`,
    visibility: (abs > 3 ? 'hidden' : 'visible') as 'hidden' | 'visible',
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
    <div class="absolute inset-0 overflow-hidden" style="transform-style: preserve-3d">
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
