<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-vue-next'

interface Props {
  id?: string
  modelValue?: boolean
  disabled?: boolean
  required?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checked = ref(props.modelValue ?? false)

const toggle = () => {
  if (props.disabled) return
  checked.value = !checked.value
  emit('update:modelValue', checked.value)
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    :disabled="disabled"
    :required="required"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
      props.class
    )"
    @click="toggle"
  >
    <span class="flex items-center justify-center text-current">
      <Check class="h-4 w-4" />
    </span>
  </button>
</template>
