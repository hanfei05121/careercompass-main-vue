import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast {
  id: number
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = nextId++
    toasts.value.push({ id, title, description, variant })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 5000)
  }

  return { toast, toasts }
})
