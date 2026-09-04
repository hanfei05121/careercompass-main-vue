<script setup lang="ts">
import { ref, watch, provide } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedValue = ref(props.modelValue || '')

watch(() => props.modelValue, (val) => {
  selectedValue.value = val || ''
})

const select = (value: string) => {
  selectedValue.value = value
  emit('update:modelValue', value)
}

provide('radioGroupContext', { select, selectedValue })
</script>

<template>
  <div :class="cn('flex gap-4', props.class)" role="radiogroup">
    <slot />
  </div>
</template>
