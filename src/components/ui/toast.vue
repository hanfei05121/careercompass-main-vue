<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'

const toastStore = useToastStore()

const close = (id: number) => {
  toastStore.toasts = toastStore.toasts.filter(t => t.id !== id)
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
    <div
      v-for="t in toastStore.toasts"
      :key="t.id"
      :class="cn(
        'rounded-lg border p-4 shadow-lg bg-background',
        t.variant === 'destructive' && 'border-destructive text-destructive'
      )"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="font-semibold">{{ t.title }}</p>
          <p v-if="t.description" class="text-sm text-muted-foreground mt-1">{{ t.description }}</p>
        </div>
        <button @click="close(t.id)" class="text-muted-foreground hover:text-foreground">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
