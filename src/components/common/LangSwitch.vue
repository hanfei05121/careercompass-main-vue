<script setup lang="ts">
/**
 * LangSwitch —— 语言切换器（中/英），写入 localStorage 并联动 Element Plus
 */
import { useI18n } from 'vue-i18n'
import { currentLocale, localeOptions, setLocale, type AppLocale } from '@/locales'

const { t } = useI18n()

const handleChange = (value: string | number | boolean | object) => {
  setLocale(value as AppLocale)
}
</script>

<template>
  <el-select
    :model-value="currentLocale"
    :placeholder="t('common.loading')"
    class="w-28"
    size="default"
    @change="handleChange"
  >
    <el-option
      v-for="option in localeOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>
