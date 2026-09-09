<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 5. 掀牌翻转（边滑边翻面）
 * 卡片向一侧滑出的同时完成翻面，落下时已切换成下一张。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)
/** 翻转角度（deg）：0 正面，180 背面（下一张），-180 背面（上一张） */
const angle = ref(0)
const flipping = ref(false)
/** 翻面结束瞬间的归位需要关闭过渡，避免倒转回来 */
const smooth = ref(true)

const currentCard = computed(() => props.cards[index.value])
const nextCard = computed(() => props.cards[(index.value + 1) % total.value])
const prevCard = computed(() => props.cards[(index.value - 1 + total.value) % total.value])

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    if (flipping.value) return
    const passed = Math.abs(offsetX) > 90 || Math.abs(velocityX) > 0.45
    if (!passed) {
      angle.value = 0
      return
    }
    finishFlip(offsetX < 0 ? 1 : -1)
  },
})

const finishFlip = (dir: 1 | -1) => {
  flipping.value = true
  angle.value = dir * 180
  window.setTimeout(() => {
    smooth.value = false
    index.value = (index.value + dir + total.value) % total.value
    angle.value = 0
    window.requestAnimationFrame(() => {
      smooth.value = true
      flipping.value = false
    })
  }, 470)
}

const stageStyle = computed(() => {
  const dragAngle = dragging.value ? (-dx.value / 240) * 180 : 0
  const deg = flipping.value || !dragging.value ? angle.value : dragAngle
  return {
    transform: `translateX(${dragging.value ? dx.value * 0.32 : 0}px) rotateY(${deg}deg)`,
    transition: smooth.value && !dragging.value ? 'transform .46s cubic-bezier(.4,.05,.2,1)' : 'none',
  }
})

defineExpose({
  next: () => finishFlip(1),
  prev: () => finishFlip(-1),
})
</script>

<template>
  <div
    class="relative h-full w-full touch-none select-none"
    style="perspective: 1400px"
    @pointerdown="onPointerDown"
  >
    <div
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px] cursor-grab active:cursor-grabbing"
      style="transform-style: preserve-3d"
      :style="stageStyle"
    >
      <div class="face">
        <DeckCardFace :card="currentCard" :index="currentCard.id" :total="total" />
      </div>
      <div class="face face-back">
        <DeckCardFace
          :card="angle > 0 ? nextCard : prevCard"
          :index="(angle > 0 ? nextCard : prevCard).id"
          :total="total"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.face-back {
  transform: rotateY(180deg);
}
</style>
