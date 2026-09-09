<script setup lang="ts">
import type { DeckCard } from '../types'

/** 演示卡片的统一外观：10 种动画共用，只负责长相，不负责位移 */
const props = withDefaults(
  defineProps<{
    card: DeckCard
    /** 当前序号（1 起），用于角标 */
    index?: number
    /** 总数 */
    total?: number
    /** 是否显示右上角序号 */
    showIndex?: boolean
  }>(),
  {
    index: 1,
    total: 1,
    showIndex: true,
  }
)
</script>

<template>
  <div
    class="relative h-full w-full select-none overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br shadow-2xl"
    :class="props.card.gradient"
  >
    <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15" />
    <div class="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-black/10" />

    <div class="relative flex h-full flex-col justify-between p-5 text-white">
      <div class="flex items-start justify-between">
        <span
          class="rounded-full bg-white/25 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
        >
          {{ card.tag }}
        </span>
        <span v-if="showIndex" class="text-xs font-medium text-white/75">
          {{ index }} / {{ total }}
        </span>
      </div>

      <div>
        <p class="text-2xl font-semibold tracking-tight drop-shadow-sm">{{ card.title }}</p>
        <p class="mt-1 text-sm text-white/85">{{ card.subtitle }}</p>
      </div>
    </div>
  </div>
</template>
