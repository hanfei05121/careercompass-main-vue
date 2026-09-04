<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  id?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const context = inject<any>('radioGroupContext')
const isChecked = computed(() => context?.selectedValue?.value === props.value)

const handleClick = () => {
  context?.select(props.value)
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :id="id"
    :aria-checked="isChecked"
    :class="cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      isChecked ? 'bg-primary' : '',
      props.class
    )"
    @click="handleClick"
  >
    <span v-if="isChecked" class="flex items-center justify-center">
      <span class="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
    </span>
  </button>
</template>
