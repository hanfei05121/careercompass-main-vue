/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标识 */
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_CODE: string
  readonly VITE_ROUTER_BASE?: string
  /** 当前环境：development | test | production */
  readonly VITE_APP_ENV?: 'development' | 'test' | 'production'
  /** 接口基础地址 */
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_UPLOAD_URL?: string
  /** 开发代理 */
  readonly VITE_PROXY_TARGET?: string
  readonly VITE_USE_PROXY?: string
  /** 功能开关 */
  readonly VITE_USE_MOCK?: string
  readonly VITE_ENABLE_DEVTOOLS?: string
  readonly VITE_DROP_CONSOLE?: string
  readonly VITE_SOURCEMAP?: string
  readonly VITE_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'
  /** 国际化 */
  readonly VITE_DEFAULT_LOCALE?: string
  readonly VITE_I18N_FALLBACK_LOCALE?: string
  /** 鉴权总开关，'true' 时启用 Firebase 登录鉴权 */
  readonly VITE_AUTH_ENABLED?: string
  /** Firebase 配置 */
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
