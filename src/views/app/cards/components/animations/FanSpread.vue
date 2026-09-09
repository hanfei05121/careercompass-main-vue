<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 4. 扇形展开（先散开再抽出）
 * 卡片像扑克牌一样先扇形散开，再把目标卡抽到最前，其余收回。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

type Phase = 'idle' | 'spread' | 'drawn'

const total = computed(() => props.cards.length)
const phase = ref<Phase>('idle')
const selected = ref(0)

/** 点击舞台：叠放 → 散开 → 抽出 → 收回，循环演示 */
const toggle = () => {
  if (phase.value === 'idle') {
    phase.value = 'spread'
    selected.value = -1
    return
  }
  if (phase.value === 'spread') {
    selected.value = Math.floor(total.value / 2)
    phase.value = 'drawn'
    return
  }
  phase.value = 'idle'
  selected.value = 0
}

/** 从扇形中抽出某张卡 */
const pick = (i: number) => {
  selected.value = i
  phase.value = 'drawn'
}

const cardStyle = (i: number) => {
  if (phase.value === 'spread') {
    const angle = (i - (total.value - 1) / 2) * 11
    const rad = (angle * Math.PI) / 180
    return {
      transform: `translateX(${Math.sin(rad) * 210}px) translateY(${(1 - Math.cos(rad)) * 60}px) rotate(${angle}deg) scale(0.9)`,
      zIndex: `${10 + i}`,
      transition: 'transform .45s cubic-bezier(.22,1,.36,1)',
    }
  }

  if (phase.value === 'drawn' && i === selected.value) {
    return {
      transform: 'translateY(-36px) scale(1.06) rotate(0deg)',
      zIndex: '100',
      transition: 'transform .5s cubic-bezier(.34,1.4,.64,1)',
    }
  }

  // 叠放 / 收回状态
  return {
    transform: `translateY(${i * 4}px) rotate(${i * 1.6}deg) scale(${1 - i * 0.015})`,
    zIndex: `${10 + i}`,
    transition: 'transform .4s cubic-bezier(.22,1,.36,1)',
  }
}

defineExpose({
  next: () => {
    selected.value = ((selected.value < 0 ? 0 : selected.value) + 1) % total.value
    phase.value = 'drawn'
  },
  prev: () => {
    const base = selected.value < 0 ? 0 : selected.value
    selected.value = (base - 1 + total.value) % total.value
    phase.value = 'drawn'
  },
})
</script>

<template>
  <div class="relative h-full w-full select-none" @click="toggle">
    <div
      v-for="(card, i) in cards"
      :key="card.id"
      class="absolute left-1/2 top-1/2 -ml-[120px] -mt-[160px] h-[320px] w-[240px] cursor-pointer"
      :style="cardStyle(i)"
      @click.stop="pick(i)"
    >
      <DeckCardFace :card="card" :index="card.id" :total="total" />
    </div>

    <p
      class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground"
    >
      点击卡片区域：散开 → 抽出 → 收回
    </p>
  </div>
</template>
