<script setup lang="ts">
import { ref, watch, provide } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectedValue = ref(props.modelValue || '')
const selectedLabel = ref('')

watch(() => props.modelValue, (val) => {
  selectedValue.value = val || ''
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const select = (value: string, label: string) => {
  selectedValue.value = value
  selectedLabel.value = label
  emit('update:modelValue', value)
  isOpen.value = false
}

provide('selectContext', { select, selectedValue })
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
      @click="toggle"
    >
      <span>{{ selectedLabel || selectedValue || placeholder }}</span>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </button>
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { inject } from 'vue'

export const SelectTrigger = {
  name: 'SelectTrigger',
  template: `<div><slot /></div>`,
}

export const SelectValue = {
  name: 'SelectValue',
  props: ['placeholder'],
  template: `<span>{{ placeholder }}</span>`,
}

export const SelectContent = {
  name: 'SelectContent',
  template: `<div class="py-1"><slot /></div>`,
}

export const SelectItem = {
  name: 'SelectItem',
  props: ['value'],
  setup(props: any) {
    const context = inject<any>('selectContext')
    const handleClick = () => {
      context?.select(props.value, props.value)
    }
    return { handleClick }
  },
  template: `<div class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground" @click="handleClick"><slot /></div>`,
}
</script>
