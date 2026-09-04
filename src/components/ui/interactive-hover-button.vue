<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  /** 按钮文案 */
  text?: string
  /** 原生 type */
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Button',
  type: 'button',
  disabled: false,
  class: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="
      cn(
        'group relative w-32 cursor-pointer overflow-hidden rounded-full border bg-background px-6 py-2 text-center font-semibold disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @click="emit('click', $event)"
  >
    <!-- 默认文案：hover 时向右滑出并淡出 -->
    <span class="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
      {{ text }}
    </span>
    <!-- hover 覆盖层：文案 + 图标淡入 -->
    <div
      class="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100"
    >
      <span>{{ text }}</span>
      <slot name="icon">
        <ArrowRight class="h-4 w-4" />
      </slot>
    </div>
  </button>
</template>
