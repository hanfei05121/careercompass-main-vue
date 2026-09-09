<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 11. 探探甩卡（拖着一张划走）
 * 顶卡全程跟手：随手指位移并旋转，松手时若甩得够远则飞出画面外，
 * 下一张补上；否则回弹归位。飞走的卡补到队尾，形成循环。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
const index = ref(0)

/** 拖动位移 / 旋转，松手后是否飞出 */
const offsetX = ref(0)
const offsetY = ref(0)
const flying = ref(false)
let timer: number | null = null

onBeforeUnmount(() => {
  if (timer !== null) window.clearTimeout(timer)
})

const clearTimer = () => {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
}

/** 顶卡当前的拖动角度：跟随手指，水平拖动越多倾斜越大 */
const rotate = computed(() => offsetX.value / 14)

const leave = (passed: boolean, dir: 1 | -1) => {
  if (flying.value) return
  if (!passed) {
    // 未甩出，回弹归位
    offsetX.value = 0
    offsetY.value = 0
    return
  }
  // 甩出：沿拖动方向飞到画面外，同时更新下一张
  flying.value = true
  const startX = offsetX.value
  const startY = offsetY.value
  const targetX = dir * (startX > 0 ? Math.max(startX + 560, 560) : 560)
  offsetX.value = targetX
  offsetY.value = startY + dir * 60

  // 飞出结束后翻页并复位，让下一张作为新顶卡
  clearTimer()
  timer = window.setTimeout(() => {
    flying.value = false
    offsetX.value = 0
    offsetY.value = 0
    index.value = (index.value + (dir < 0 ? 1 : -1) + total.value) % total.value
  }, 500)
}

const { dragging, onPointerDown } = usePointerDrag({
  axis: 'both',
  onMove: ({ dx: x, dy: y }) => {
    if (!dragging.value || flying.value) return
    offsetX.value = x
    offsetY.value = y
  },
  onRelease: ({ dx: x, velocityX }) => {
    if (flying.value) return
    const passed = Math.abs(x) > 100 || Math.abs(velocityX) > 0.5
    leave(passed, x < 0 ? -1 : 1)
  },
})

/** 顶卡样式：跟手拖动或飞出 */
const topStyle = computed(() => {
  if (!dragging.value && !flying.value) {
    return {
      transform: 'translate3d(0,0,0) rotate(0)',
      zIndex: '20',
      transition: 'transform .35s cubic-bezier(.34,1.45,.64,1)',
      opacity: '1',
    }
  }
  return {
    transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) rotate(${rotate.value}deg)`,
    zIndex: '20',
    transition: flying.value
      ? 'transform .5s cubic-bezier(.4,.0,.7,.3), opacity .5s linear'
      : 'none',
    opacity: flying.value ? '0' : '1',
  }
})

/** 下层备用卡：露出一点边，提示下面还有卡 */
const bottomStyle = computed(() => ({
  transform: 'translate3d(0,8px,0) rotate(2deg) scale(0.96)',
  zIndex: '10',
  opacity: '1',
}))

defineExpose({
  next: () => leave(true, -1),
  prev: () => leave(true, 1),
})
</script>

<template>
  <div class="relative h-full w-full touch-none select-none" @pointerdown="onPointerDown">
    <!-- 下层备用卡：露边提示 -->
    <div v-if="!flying" class="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px]">
      <div class="h-full w-full" :style="bottomStyle">
        <DeckCardFace
          :card="cards[(index + 1) % cards.length]"
          :index="cards[(index + 1) % cards.length].id"
          :total="total"
        />
      </div>
    </div>

    <!-- 顶卡：跟手拖动 -->
    <div
      class="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px] cursor-grab active:cursor-grabbing"
    >
      <div class="h-full w-full" :style="topStyle">
        <DeckCardFace :card="cards[index]" :index="cards[index].id" :total="total" />
      </div>
    </div>

    <p class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
      左右拖动甩出：划走一张换下一张
    </p>
  </div>
</template>