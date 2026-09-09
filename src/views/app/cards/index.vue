<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight, Layers } from 'lucide-vue-next'
import BasePage from '@/components/common/BasePage.vue'
import MiniPreview from './components/MiniPreview.vue'
import { CARD_ANIMATIONS } from './types'

const router = useRouter()

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

        <!-- 动态缩略：嵌入真实动画组件，自动轮播预览 -->
        <div class="relative mb-4 h-40 overflow-hidden rounded-xl bg-muted/40">
          <MiniPreview :type="item.type" />
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
