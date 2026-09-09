<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 6. 纵向滚轮（上下拨着换）
 * 卡片像滚轮一样上下滚动：正对用户的卡片最大最清晰，
 * 上下卡片紧密层叠、逐渐旋转扭转并模糊淡出，形成景深效果。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)

/** 相邻卡片之间的纵向间距（px），卡片大部分被前后遮挡 */
const STEP_Y = 76
/** 每级卡片的旋转角度（deg），上下方向相反，形成扇形扭转 */
const STEP_ROTATE = 10

const { dy, dragging, onPointerDown } = usePointerDrag({
  axis: 'y',
  onRelease: ({ dy: offsetY, velocityY }) => {
    let delta = -offsetY / STEP_Y
    if (Math.abs(velocityY) > 0.5) delta += velocityY > 0 ? -0.7 : 0.7
    const next = Math.round(index.value + delta)
    index.value = ((next % total.value) + total.value) % total.value
  },
})

const pos = computed(() => index.value + (dragging.value ? -dy.value / STEP_Y : 0))

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
  // 距离中心越远：越小、越淡、越模糊
  const scale = Math.max(0.72, 1 - abs * 0.09)
  const blur = Math.min(9, abs * 3)
  return {
    transform: `translateY(${offset * STEP_Y}px) rotate(${-offset * STEP_ROTATE}deg) scale(${scale})`,
    opacity: `${Math.max(0, 1 - abs * 0.24)}`,
    filter: `blur(${blur.toFixed(1)}px)`,
    zIndex: `${100 - Math.round(abs * 10)}`,
    visibility: (abs > 3.4 ? 'hidden' : 'visible') as 'hidden' | 'visible',
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
    <div class="absolute inset-0">
      <div
        v-for="(card, i) in cards"
        :key="card.id"
        class="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px]"
        :style="cardStyle(i)"
      >
        <DeckCardFace :card="card" :index="card.id" :total="total" />
      </div>
    </div>
  </div>
</template>
