<script setup lang="ts">
/**
 * BaseForm —— 统一表单：schema 驱动 + el-form 校验 + 提交 loading
 * schema 中的 rules 可直接使用 @/utils/rules 提供的规则工厂
 */
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface FormFieldOption {
  label: string
  value: string | number
}

export interface FormField {
  prop: string
  label: string
  /** 输入类型，默认 input */
  type?: 'input' | 'textarea' | 'select' | 'password' | 'number'
  placeholder?: string
  options?: FormFieldOption[]
  disabled?: boolean
  rows?: number
  span?: number
}

const props = withDefaults(
  defineProps<{
    fields: FormField[]
    rules?: FormRules
    submitText?: string
    cancelText?: string
    labelWidth?: number | string
    disabled?: boolean
  }>(),
  {
    rules: () => ({}),
    submitText: '保存',
    cancelText: '取消',
    labelWidth: 100,
    disabled: false,
  }
)

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

/** 由 fields 初始化表单值，外部可用 setValues 覆盖 */
const values = reactive<Record<string, unknown>>({})
props.fields.forEach((field) => {
  if (values[field.prop] === undefined) values[field.prop] = ''
})

const setValues = (data: Record<string, unknown>) => Object.assign(values, data)

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    emit('submit', { ...values })
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => emit('cancel')

defineExpose({ formRef, setValues, values, submitting })
</script>

<template>
  <el-form
    ref="formRef"
    :model="values"
    :rules="rules"
    :label-width="labelWidth"
    :disabled="disabled"
    @submit.prevent="handleSubmit"
  >
    <el-form-item
      v-for="field in fields"
      :key="field.prop"
      :label="field.label"
      :prop="field.prop"
    >
      <el-input
        v-if="!field.type || field.type === 'input'"
        v-model="values[field.prop] as string"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        clearable
      />
      <el-input
        v-else-if="field.type === 'password'"
        v-model="values[field.prop] as string"
        type="password"
        :placeholder="field.placeholder"
        show-password
        clearable
      />
      <el-input-number
        v-else-if="field.type === 'number'"
        v-model="values[field.prop] as number"
        class="!w-full"
        :disabled="field.disabled"
      />
      <el-input
        v-else-if="field.type === 'textarea'"
        v-model="values[field.prop] as string"
        type="textarea"
        :rows="field.rows ?? 4"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
      />
      <el-select
        v-else-if="field.type === 'select'"
        v-model="values[field.prop] as string"
        :placeholder="field.placeholder ?? '请选择'"
        :disabled="field.disabled"
        class="!w-full"
      >
        <el-option
          v-for="option in field.options"
          :key="String(option.value)"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="!$slots.default">
      <div class="form-actions w-full">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitText }}
        </el-button>
      </div>
    </el-form-item>
    <slot :values="values" :submitting="submitting" />
  </el-form>
</template>
