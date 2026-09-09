<script setup lang="ts">
import { computed, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 15. 发牌掉落（新卡从上面砸下来）
 * 当前展示一叠倾斜的牌，切换时新牌从上方旋转飞落后砸在牌堆顶上，
 * 旧的顶牌被顺势压下去一层，形成“发牌收进牌堆”的动态。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

const VISIBLE = 4
const total = computed(() => props.cards.length)
const index = ref(0)

/** 牌堆：0 为最上层（当前展示），越往下越是旧牌 */
const stack = computed(() =>
  Array.from({ length: VISIBLE }, (_, depth) => ({
    depth,
    card: props.cards[(index.value - depth + total.value * 4) % total.value],
  }))
)

const { onPointerDown } = usePointerDrag({
  axis: 'y',
  onRelease: ({ dy, velocityY }) => {
    const passed = Math.abs(dy) > 80 || Math.abs(velocityY) > 0.45
    if (!passed) return
    index.value = (index.value + (dy < 0 ? 1 : -1) + total.value) % total.value
  },
})

const cardStyle = (depth: number) => ({
  transform: `translateY(${depth * 12}px) rotate(${depth * (depth % 2 === 0 ? 4 : -4)}deg) scale(${1 - depth * 0.05})`,
  zIndex: `${20 - depth}`,
  filter: depth > 0 ? 'brightness(0.92)' : 'none',
  transition: 'transform .45s cubic-bezier(.22,1,.36,1), filter .45s ease',
})

defineExpose({
  next: () => (index.value = (index.value + 1) % total.value),
  prev: () => (index.value = (index.value - 1 + total.value) % total.value),
})
</script>

<template>
  <div class="relative h-full w-full touch-none select-none" @pointerdown="onPointerDown">
    <div class="relative h-full w-full">
      <div
        v-for="item in stack"
        :key="item.card.id"
        class="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px]"
        :style="cardStyle(item.depth)"
      >
        <!-- 只有最上层新发的牌带掉落动画；换新 id 时自动重新触发 -->
        <div
          v-if="item.depth === 0"
          :key="item.card.id"
          class="h-full w-full deal-enter"
        >
          <DeckCardFace :card="item.card" :index="item.card.id" :total="total" />
        </div>
        <div v-else class="h-full w-full">
          <DeckCardFace :card="item.card" :index="item.card.id" :total="total" />
        </div>
      </div>
    </div>

    <p class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
      上下拖动或点击：新牌从上方旋转砸进牌堆
    </p>
  </div>
</template>

<style scoped>
.deal-enter {
  transform-origin: 50% -60%;
  animation: deal-drop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.12);
}

@keyframes deal-drop {
  0% {
    transform: translateY(-150px) rotate(340deg) scale(0.55);
    opacity: 0;
  }
  68% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
}
</style>