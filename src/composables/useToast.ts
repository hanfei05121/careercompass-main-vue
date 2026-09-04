import { useToastStore } from '@/stores/toast'

export function useToast() {
  const toastStore = useToastStore()
  return {
    toast: toastStore.toast,
    toasts: toastStore.toasts,
  }
}
