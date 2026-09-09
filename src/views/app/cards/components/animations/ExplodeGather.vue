<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 9. 打散聚拢（先炸开再收回）
 * 卡片先向四周炸开散开，再聚拢收回，新的卡片显示在最上层。
 * 实现要点：每层卡片使用固定的 depth 作为 key，DOM 全程复用，
 * 炸开与聚拢是同一批元素的连续过渡，切换只发生在飞散途中，保证丝滑。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

type Phase = 'idle' | 'explode' | 'gather'

const STACK_SIZE = 5
const EXPLODE_MS = 560
const GATHER_MS = 680
/** 每层错开的启动延迟，让炸开/聚拢有先后节奏而非整齐划一 */
const STAGGER_MS = 30

const total = computed(() => props.cards.length)
const index = ref(0)
const phase = ref<Phase>('idle')

/** 当前可见的一叠卡片（层位固定，内容随 index 轮转） */
const stack = computed(() =>
  Array.from({ length: STACK_SIZE }, (_, k) => ({
    depth: k,
    card: props.cards[(index.value + k) % total.value],
  }))
)

let timers: number[] = []

const burst = (dir: 1 | -1) => {
  if (phase.value !== 'idle') return
  phase.value = 'explode'
  // 等最远一层也飞到位后，再在飞散状态下更换卡片内容并聚拢
  timers.push(
    window.setTimeout(() => {
      index.value = (index.value + dir + total.value) % total.value
      phase.value = 'gather'
      timers.push(
        window.setTimeout(() => {
          phase.value = 'idle'
        }, GATHER_MS + (STACK_SIZE - 1) * STAGGER_MS)
      )
    }, EXPLODE_MS + (STACK_SIZE - 1) * STAGGER_MS)
  )
}

onBeforeUnmount(() => timers.forEach((t) => window.clearTimeout(t)))

/** 收回后的静止位：轻微下移 + 缩小，形成一叠的层次感 */
const restTransform = (depth: number) =>
  `translate3d(0, ${depth * 6}px, 0) scale(${1 - depth * 0.03})`

const cardStyle = (depth: number) => {
  const delay = `${depth * STAGGER_MS}ms`
  if (phase.value === 'explode') {
    const angle = ((depth * 72 + 24) * Math.PI) / 180
    return {
      transform: `translate3d(${Math.cos(angle) * 260}px, ${Math.sin(angle) * 205}px, 0) rotate(${depth % 2 === 0 ? 18 : -18}deg) scale(0.72)`,
      opacity: '0.7',
      zIndex: `${30 - depth}`,
      // 快速弹出、末端减速，像被抛出去
      transition: `transform ${EXPLODE_MS}ms cubic-bezier(.16,.84,.3,1) ${delay}, opacity ${EXPLODE_MS}ms ease-out ${delay}`,
    }
  }
  return {
    transform: restTransform(depth),
    opacity: '1',
    zIndex: `${30 - depth}`,
    // 平滑归位，收尾带一点点的回弹
    transition: `transform ${GATHER_MS}ms cubic-bezier(.22,1.06,.36,1) ${delay}, opacity ${GATHER_MS}ms ease ${delay}`,
  }
}

defineExpose({
  next: () => burst(1),
  prev: () => burst(-1),
})
</script>

<template>
  <div class="relative h-full w-full cursor-pointer select-none" @click="burst(1)">
    <div
      v-for="item in stack"
      :key="item.depth"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px] will-change-transform"
      :style="cardStyle(item.depth)"
    >
      <DeckCardFace :card="item.card" :index="item.card.id" :total="total" />
    </div>

    <p
      class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground"
    >
      点击任意位置触发：炸开 → 聚拢
    </p>
  </div>
</template>
