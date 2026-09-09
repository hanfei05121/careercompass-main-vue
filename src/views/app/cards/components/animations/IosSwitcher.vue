<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 14. iOS 缩放切换器（当前最大，两侧收身排开）
 * 聚焦卡居中放大最清晰，左右相邻卡缩小并下沉到两侧叠放，
 * 越远越小越虚，像 iOS 应用切换器一样有强烈的景深与层级。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const GAP = 240
const total = computed(() => props.cards.length)
const index = ref(0)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: x, velocityX }) => {
    let delta = -x / GAP
    if (Math.abs(velocityX) > 0.5) delta += velocityX > 0 ? -0.7 : 0.7
    const next = Math.round(index.value + delta)
    index.value = ((next % total.value) + total.value) % total.value
  },
})

const pos = computed(() => index.value + (dragging.value ? -dx.value / GAP : 0))

const relOffset = (i: number) => {
  const n = total.value
  let d = i - pos.value
  while (d > n / 2) d -= n
  while (d < -n / 2) d += n
  return d
}

const cardStyle = (i: number) => {
  const offset = relOffset(i)
  const a = Math.abs(offset)
  const sign = offset >= 0 ? 1 : -1
  const close = Math.min(a, 1)
  // 两侧卡片缩小并下沉，中间聚焦卡恢复原大
  const scale = 1 - close * 0.5
  return {
    transform: `translateX(${sign * Math.max(Math.abs(offset) - 0.5, 0) * GAP}px) translateY(${-close * 36}px) scale(${scale})`,
    opacity: `${1 - close * 0.52}`,
    filter: `blur(${Math.min(3, a * 1.5)}px)`,
    zIndex: `${100 - Math.round(a * 10)}`,
    visibility: (a > 2.8 ? 'hidden' : 'visible') as 'hidden' | 'visible',
    transition: dragging.value
      ? 'none'
      : 'transform .5s cubic-bezier(.22,1,.36,1), opacity .5s ease, filter .5s ease',
  }
}

defineExpose({
  next: () => (index.value = (index.value + 1) % total.value),
  prev: () => (index.value = (index.value - 1 + total.value) % total.value),
})
</script>

<template>
  <div class="relative h-full w-full touch-none select-none" @pointerdown="onPointerDown">
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="(card, i) in cards"
        :key="card.id"
        class="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px]"
        :style="cardStyle(i)"
      >
        <DeckCardFace :card="card" :index="card.id" :total="total" />
      </div>
    </div>

    <p class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
      左右拖动：中间放大被聚焦，两侧缩小排开
    </p>
  </div>
</template>