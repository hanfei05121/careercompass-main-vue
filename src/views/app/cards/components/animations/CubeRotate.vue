<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 7. 立方体面（整块转过去）
 * 卡片贴在立方体的四个侧面上，整块立方体转动，下一张从侧面转出覆盖当前位置。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const FACE_COUNT = 4
/** 立方体半宽 = 卡片宽度的一半 */
const DEPTH = 120

const faces = computed(() => props.cards.slice(0, FACE_COUNT))
const total = computed(() => faces.value.length)
const index = ref(0)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    let delta = -offsetX / 260
    if (Math.abs(velocityX) > 0.5) delta += velocityX > 0 ? -0.7 : 0.7
    const next = Math.round(index.value + delta)
    index.value = ((next % total.value) + total.value) % total.value
  },
})

const pos = computed(() => index.value + (dragging.value ? -dx.value / 260 : 0))

const stageStyle = computed(() => ({
  transform: `rotateY(${-90 * pos.value}deg)`,
  transition: dragging.value ? 'none' : 'transform .6s cubic-bezier(.22,1,.36,1)',
}))

const faceStyle = (i: number) => ({
  transform: `rotateY(${i * 90}deg) translateZ(${DEPTH}px)`,
})

defineExpose({
  next: () => (index.value = (index.value + 1) % total.value),
  prev: () => (index.value = (index.value - 1 + total.value) % total.value),
})
</script>

<template>
  <div
    class="relative h-full w-full touch-none select-none"
    style="perspective: 1300px"
    @pointerdown="onPointerDown"
  >
    <div
      class="absolute left-1/2 top-1/2 h-[320px] w-[240px]"
      style="transform-style: preserve-3d; margin-left: -120px; margin-top: -160px"
      :style="stageStyle"
    >
      <div
        v-for="(card, i) in faces"
        :key="card.id"
        class="absolute inset-0"
        :style="faceStyle(i)"
      >
        <DeckCardFace :card="card" :index="i + 1" :total="total" />
      </div>
    </div>
  </div>
</template>
