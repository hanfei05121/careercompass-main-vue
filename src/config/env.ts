import type { AppEnv, AppEnvType } from './types'

/** 字符串转布尔 */
const toBoolean = (value: unknown, fallback = false): boolean => {
  if (value === undefined || value === null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const env = import.meta.env

const resolveEnvType = (): AppEnvType => {
  const mode = String(env.VITE_APP_ENV ?? env.MODE ?? 'development')
  if (mode === 'production' || mode === 'prod') return 'production'
  if (mode === 'test') return 'test'
  return 'development'
}

/** 集中读取的环境对象，业务代码禁止直接访问 import.meta.env */
export const appEnv: AppEnv = Object.freeze({
  env: resolveEnvType(),
  appTitle: env.VITE_APP_TITLE || 'CareerCompass',
  appCode: env.VITE_APP_CODE || 'careercompass',
  routerBase: env.VITE_ROUTER_BASE || '/',
  apiBaseUrl: env.VITE_API_BASE_URL || '/api',
  proxyTarget: env.VITE_PROXY_TARGET || '',
  useProxy: toBoolean(env.VITE_USE_PROXY, true),
  apiTimeout: toNumber(env.VITE_API_TIMEOUT, 15000),
  uploadUrl: env.VITE_UPLOAD_URL || '/api/upload',
  useMock: toBoolean(env.VITE_USE_MOCK, false),
  enableDevtools: toBoolean(env.VITE_ENABLE_DEVTOOLS, false),
  dropConsole: toBoolean(env.VITE_DROP_CONSOLE, false),
  sourcemap: toBoolean(env.VITE_SOURCEMAP, false),
  logLevel: (env.VITE_LOG_LEVEL as AppEnv['logLevel']) || 'info',
  authEnabled: toBoolean(env.VITE_AUTH_ENABLED, false),
  defaultLocale: env.VITE_DEFAULT_LOCALE || 'zh-CN',
  fallbackLocale: env.VITE_I18N_FALLBACK_LOCALE || 'en-US',
})

export const isDev = appEnv.env === 'development'
export const isTest = appEnv.env === 'test'
export const isProd = appEnv.env === 'production'

export type { AppEnv, AppEnvType } from './types'
