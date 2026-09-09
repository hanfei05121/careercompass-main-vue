<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 1. 层叠滑走（无限轮播版）
 * - 顶卡为正图（不倾斜），后方卡片每层带一点弧度倾斜
 * - 顶卡带旋转飞出后，只有补上来的第一张回正，其余卡片保持弧度
 * - 飞出的卡片补到队尾，形成无限循环轮播
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)

/** 可见层数：顶卡 + 3 张带弧度的后备卡，飞出的卡从队尾重新入场 */
const VISIBLE = 4
/** 后方每层递进的弧度 / 偏移 */
const TILT = 3
const SHIFT_X = 5
const SHIFT_Y = 16

const index = ref(0)

/** 正在飞出的顶卡（动画期间作为覆盖层渲染，结束后从队尾重新入场） */
const flyCard = ref<DeckCard | null>(null)
const flyDir = ref<1 | -1>(1)
const flyStartX = ref(0)
const flyOut = ref(false)

const cardAt = (depth: number): DeckCard =>
  props.cards[(index.value + depth + total.value * 4) % total.value]

const topCard = computed(() => cardAt(0))
const backLayers = computed(() =>
  Array.from({ length: VISIBLE - 1 }, (_, i) => ({ depth: i + 1, card: cardAt(i + 1) }))
)

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: offsetX, velocityX }) => {
    const passed = Math.abs(offsetX) > 90 || Math.abs(velocityX) > 0.45
    if (!passed) return
    fly(offsetX < 0 ? -1 : 1, offsetX)
  },
})

const fly = (dir: 1 | -1, startOffset = 0) => {
  if (flyCard.value) return
  flyCard.value = cardAt(0)
  flyDir.value = dir
  flyStartX.value = startOffset
  flyOut.value = false

  // 队列立刻前移：补位卡开始回正，飞出的卡落到队尾等待重新入场
  index.value = (index.value + (dir === -1 ? 1 : -1) + total.value) % total.value

  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flyOut.value = true
      })
    })
  })
  window.setTimeout(() => {
    flyCard.value = null
    flyOut.value = false
  }, 500)
}

/** 顶卡：始终是正图，拖拽时跟手旋转 */
const topStyle = computed(() => {
  if (dragging.value) {
    return {
      transform: `translate3d(${dx.value}px, 0, 0) rotate(${dx.value / 14}deg)`,
      transition: 'none',
    }
  }
  return {
    transform: 'translate3d(0, 0, 0) rotate(0deg)',
    transition: 'transform .4s cubic-bezier(.34,1.45,.64,1)',
  }
})

/** 后方卡片：保持弧度，只有 depth 变化时平滑过渡 */
const backStyle = (depth: number) => ({
  transform: `translate3d(${depth * SHIFT_X}px, ${depth * SHIFT_Y}px, 0) rotate(${depth * TILT}deg) scale(${1 - depth * 0.045})`,
  opacity: `${1 - depth * 0.14}`,
  zIndex: `${20 - depth}`,
  transition: 'transform .4s cubic-bezier(.34,1.45,.64,1), opacity .4s linear',
})

/** 飞出覆盖层：从顶卡当前位置带旋转滑出画面 */
const flyStyle = computed(() => {
  if (!flyCard.value) return {}
  if (!flyOut.value) {
    return {
      transform: `translate3d(${flyStartX.value}px, 0, 0) rotate(${flyStartX.value / 14}deg)`,
      opacity: '1',
      zIndex: '30',
      transition: 'none',
    }
  }
  return {
    transform: `translate3d(${flyDir.value * 640}px, ${flyDir.value * 60}px, 0) rotate(${flyDir.value * 28}deg)`,
    opacity: '0',
    zIndex: '30',
    transition: 'transform .46s cubic-bezier(.45,.05,.7,.4), opacity .46s linear',
  }
})

defineExpose({
  next: () => fly(-1),
  prev: () => fly(1),
})
</script>

<template>
  <div class="relative h-full w-full touch-none select-none" @pointerdown="onPointerDown">
    <!-- 后方带弧度的卡（始终保持倾斜，只有升到顶位时才回正） -->
    <div
      v-for="item in backLayers"
      :key="`back-${item.card.id}`"
      class="back-enter absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px]"
      :style="backStyle(item.depth)"
    >
      <DeckCardFace :card="item.card" :index="item.card.id" :total="total" />
    </div>

    <!-- 飞出动画覆盖层（旧顶卡滑向画面外） -->
    <div
      v-if="flyCard"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px]"
      :style="flyStyle"
    >
      <DeckCardFace :card="flyCard" :index="flyCard.id" :total="total" />
    </div>

    <!-- 顶卡：正图 -->
    <div
      v-if="topCard"
      class="absolute left-1/2 top-1/2 z-20 -ml-[120px] -mt-[160px] h-[320px] w-[240px] cursor-grab active:cursor-grabbing"
      :style="topStyle"
    >
      <div :key="topCard.id" class="straighten h-full w-full">
        <DeckCardFace :card="topCard" :index="topCard.id" :total="total" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 补位卡入场：从弧度位回正到正图（只有顶卡回正，其余保持弧度） */
.straighten {
  animation: straighten 0.42s cubic-bezier(0.34, 1.45, 0.64, 1);
}

@keyframes straighten {
  from {
    transform: translate3d(5px, 16px, 0) rotate(3deg) scale(0.955);
  }
  to {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
}

/* 飞出的卡从队尾重新入场（无限轮播） */
.back-enter {
  animation: back-enter 0.4s ease-out;
}

@keyframes back-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
