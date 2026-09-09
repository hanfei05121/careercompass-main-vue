<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 12. 环绕传送带（整圈旋转）
 * 卡片环绕排列在 3D 圆周上，拖动时整圈旋转，转到正前方的卡片被放大突出。
 * 关键：位置 pos 连续累积、永不取模。若对 index 取模，转满一圈时旋转角
 * 会从 315° 跳回 0°，过渡动画就会倒转一整圈——这就是之前"不无限循环"的原因。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const total = computed(() => props.cards.length)
/** 连续位置（单位：卡位步数，可为任意实数、不取模 → 真无限循环） */
const pos = ref(0)
/** 绕满一圈的卡片数 */
const COUNT = total.value
/** 每张卡占的角度（deg） */
const STEP = 360 / COUNT
/** 每转过一个卡位需要的拖动位移（px） */
const DRAG_PER_STEP = 90
const RADIUS = 400

const { dx, dragging, onPointerDown } = usePointerDrag({
  axis: 'x',
  onRelease: ({ dx: x, velocityX }) => {
    let delta = -x / DRAG_PER_STEP
    if (Math.abs(velocityX) > 0.5) delta += velocityX > 0 ? -0.7 : 0.7
    // 在连续位置上取整吸附，不做取模回卷
    pos.value = Math.round(pos.value + delta)
  },
})

/** 连续旋转角（deg）：拖动中为小数，松手后取整吸附到卡位 */
const rot = computed(
  () => (pos.value + (dragging.value ? -dx.value / DRAG_PER_STEP : 0)) * STEP,
)

/**
 * 每张卡的实时样式：整圈全部可见（背面不裁剪），
 * 并按其当前朝向与观察者的夹角做明暗/模糊渐变——
 * 正前方清晰明亮，转到远端变暗变虚，前突后衬。
 */
const cardStyle = (i: number) => {
  const angle = i * STEP - rot.value
  // 归一化到 -180 ~ 180，cos 正好衡量"面向观察者的程度"：1 正前，-1 正后
  const rad = ((angle * Math.PI) / 180) % (Math.PI * 2)
  const facing = Math.cos(rad)
  const front = (facing + 1) / 2 // 0 远端 ~ 1 正前
  return {
    // 卡片自身在环上的固定位置（旋转由父容器统一承担），只按朝向调整明暗与清晰度
    transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`,
    filter: `brightness(${(0.45 + 0.55 * front).toFixed(3)}) blur(${((1 - front) * 2.2).toFixed(2)}px)`,
  }
}

defineExpose({
  next: () => (pos.value += 1),
  prev: () => (pos.value -= 1),
})
</script>

<template>
  <div
    class="relative h-full w-full touch-none select-none"
    style="perspective: 1400px"
    @pointerdown="onPointerDown"
  >
    <!-- 整圈卡片全部可见：背面不裁剪，转到后面的卡也能看到 -->
    <div
      class="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px]"
      style="transform-style: preserve-3d"
      :style="{
        transform: `rotateY(${-rot}deg)`,
        transition: dragging ? 'none' : 'transform .6s cubic-bezier(.22,1,.36,1)',
      }"
    >
      <div
        v-for="(card, i) in cards"
        :key="card.id"
        class="absolute inset-0"
        :style="cardStyle(i)"
      >
        <DeckCardFace :card="card" :index="card.id" :total="total" />
      </div>
    </div>

    <p class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
      左右拖动：整圈卡片可见，转到面前的最清晰
    </p>
  </div>
</template>