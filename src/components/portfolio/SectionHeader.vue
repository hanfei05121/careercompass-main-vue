<script setup lang="ts">
/**
 * SectionHeader —— 分区头部：眉标药丸 + Fraunces 标题 + 描述。
 * 度量对齐参考站点：eyebrow 10px/0.2em，标题 text-3xl → text-5xl。
 */
import type { VNodeChild } from 'vue'
import BlurReveal from './BlurReveal.vue'

withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    desc?: string
  }>(),
  { desc: '' },
)

defineSlots<{ desc?: () => VNodeChild }>()
</script>

<template>
  <header class="section-head">
    <BlurReveal :delay="0.05">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2 class="section-title font-display">{{ title }}</h2>
      <p v-if="$slots.desc || desc" class="section-desc">
        <slot name="desc">{{ desc }}</slot>
      </p>
    </BlurReveal>
  </header>
</template>

<style scoped>
.section-head {
  max-width: 42rem;
}

.section-desc {
  margin-top: 0.75rem;
  max-width: 42rem;
  font-size: 1rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
}
</style>
