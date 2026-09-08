<script setup lang="ts">
/**
 * BaseDialog —— 统一弹窗：v-model 控制显隐 + 确认/取消 + loading
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    width?: number | string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    /** 点击遮罩是否关闭 */
    closeOnClickModal?: boolean
  }>(),
  {
    width: 520,
    confirmText: '确认',
    cancelText: '取消',
    loading: false,
    closeOnClickModal: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleConfirm = () => emit('confirm')
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" :width="width" :close-on-click-modal="closeOnClickModal">
    <slot />
    <template #footer>
      <div class="form-actions !mt-0">
        <el-button @click="visible = false">{{ cancelText }}</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
