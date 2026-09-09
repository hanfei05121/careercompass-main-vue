<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight, Layers } from 'lucide-vue-next'
import BasePage from '@/components/common/BasePage.vue'
import { CARD_ANIMATIONS, DECK_CARDS } from './types'

const router = useRouter()

/** 列表缩略图用的三张演示卡（固定取前 3 张，避免每格都不同） */
const previewCards = DECK_CARDS.slice(0, 3)

const open = (type: string) => {
  router.push(`/cards/${type}`)
}
</script>

<template>
  <BasePage
    title="卡片滑动动效"
    subtitle="10 种卡片切换动画，点进去可拖拽体验真实效果"
    class="container mx-auto"
  >
    <template #actions>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
      >
        <Layers class="h-3.5 w-3.5" />
        共 {{ CARD_ANIMATIONS.length }} 种
      </span>
    </template>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="(item, i) in CARD_ANIMATIONS"
        :key="item.type"
        type="button"
        class="group flex flex-col rounded-2xl border border-border/60 bg-card p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
        @click="open(item.type)"
      >
        <div class="mb-4 flex items-center justify-between">
          <span class="text-xs font-medium tracking-widest text-muted-foreground">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary">
            {{ item.enName }}
          </span>
        </div>

        <!-- 静态缩略：三张渐变卡叠放，示意该动效的排布 -->
        <div class="relative mb-4 h-24">
          <div
            v-for="(card, k) in previewCards"
            :key="card.id"
            class="absolute left-1/2 top-1/2 h-20 w-16 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-br shadow-md transition-transform duration-300"
            :class="card.gradient"
            :style="{
              transform: `translate(-50%, -50%) rotate(${(k - 1) * 10}deg) translateX(${(k - 1) * 26}px) scale(${1 - k * 0.04})`,
              opacity: 1 - k * 0.18,
              zIndex: 10 - k,
            }"
          />
        </div>

        <h3 class="text-lg font-semibold tracking-tight">{{ item.name }}</h3>
        <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{{ item.action }}</p>
        <p class="mt-2 text-xs leading-relaxed text-muted-foreground/80">{{ item.visual }}</p>

        <span
          class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition group-hover:opacity-100"
        >
          查看效果
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>
    </div>
  </BasePage>
</template>
