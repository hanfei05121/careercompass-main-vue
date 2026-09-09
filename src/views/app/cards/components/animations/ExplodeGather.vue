<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 9. 打散聚拢（先炸开再收回）
 * 卡片先向四周炸开散开，再聚拢收回，新的卡片显示在最上层。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

type Phase = 'idle' | 'explode' | 'gather'

const STACK_SIZE = 5
const total = computed(() => props.cards.length)
const index = ref(0)
const phase = ref<Phase>('idle')

/** 当前可见的一叠卡片 */
const stack = computed(() =>
  Array.from({ length: STACK_SIZE }, (_, k) => ({
    depth: k,
    card: props.cards[(index.value + k) % total.value],
  }))
)

const burst = (dir: 1 | -1) => {
  if (phase.value !== 'idle') return
  phase.value = 'explode'
  window.setTimeout(() => {
    index.value = (index.value + dir + total.value) % total.value
    phase.value = 'gather'
    window.setTimeout(() => {
      phase.value = 'idle'
    }, 320)
  }, 360)
}

const cardStyle = (depth: number) => {
  if (phase.value === 'explode') {
    const angle = ((depth * 72 + 24) * Math.PI) / 180
    return {
      transform: `translate3d(${Math.cos(angle) * 240}px, ${Math.sin(angle) * 200}px, 0) rotate(${depth % 2 === 0 ? 16 : -16}deg) scale(0.8)`,
      opacity: '0.9',
      zIndex: `${30 - depth}`,
      transition: 'transform .36s cubic-bezier(.3,0,.2,1), opacity .36s ease',
    }
  }
  return {
    transform: `translate3d(0, ${depth * 6}px, 0) scale(${1 - depth * 0.03})`,
    opacity: '1',
    zIndex: `${30 - depth}`,
    transition: 'transform .32s cubic-bezier(.34,1.4,.64,1), opacity .32s ease',
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
      :key="`${item.card.id}-${item.depth}`"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px]"
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
