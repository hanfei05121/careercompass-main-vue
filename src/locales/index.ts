import { createI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import enUS from './lang/en-US'
import zhCN from './lang/zh-CN'
import { appEnv } from '@/config'
import { STORAGE_KEYS, SUPPORT_LOCALES } from '@/constants'
import { localCache } from '@/utils/storage'

export type AppLocale = (typeof SUPPORT_LOCALES)[number]

/** 语言选项（语言切换组件直接使用） */
export const localeOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

const isLocale = (value: unknown): value is AppLocale =>
  typeof value === 'string' && (SUPPORT_LOCALES as readonly string[]).includes(value)

/** 初始语言：本地缓存 > 环境变量默认值 > 浏览器语言 */
const resolveLocale = (): AppLocale => {
  const cached = localCache.get<string>(STORAGE_KEYS.LOCALE)
  if (isLocale(cached)) return cached
  if (isLocale(appEnv.defaultLocale)) return appEnv.defaultLocale
  const browser = navigator.language
  return browser?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

const initial = resolveLocale()

/** 响应式当前语言（非组件上下文也可读写） */
export const currentLocale = ref<AppLocale>(initial)

/** 创建 i18n 实例（组合式 API 模式） */
const i18n = createI18n({
  legacy: false,
  locale: initial,
  fallbackLocale: (isLocale(appEnv.fallbackLocale) ? appEnv.fallbackLocale : 'en-US') as AppLocale,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  missingWarn: false,
  fallbackWarn: false,
})

/** 切换语言并持久化（Element Plus 组件语言由 App.vue 的 ElConfigProvider 联动） */
export const setLocale = (locale: AppLocale) => {
  currentLocale.value = locale
  i18n.global.locale.value = locale
  localCache.set(STORAGE_KEYS.LOCALE, locale)
  document.documentElement.setAttribute('lang', locale)
}

/** 是否中文 */
export const isZhCN = computed(() => currentLocale.value === 'zh-CN')

document.documentElement.setAttribute('lang', initial)

export default i18n
