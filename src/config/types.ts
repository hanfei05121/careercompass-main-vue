/** 应用运行环境 */
export type AppEnvType = 'development' | 'test' | 'production'

/** 环境变量集中定义（与根目录 .env* 文件一一对应） */
export interface AppEnv {
  /** 当前模式：development / test / production */
  env: AppEnvType
  /** 应用标题 */
  appTitle: string
  /** 应用标识 */
  appCode: string
  /** 路由 base */
  routerBase: string
  /** 接口基础地址（开发环境一般为 /api 代理） */
  apiBaseUrl: string
  /** 开发代理目标 */
  proxyTarget: string
  /** 是否启用本地代理 */
  useProxy: boolean
  /** 接口超时时间（ms） */
  apiTimeout: number
  /** 上传接口地址 */
  uploadUrl: string
  /** 是否使用 mock 数据 */
  useMock: boolean
  /** 是否开启 vue-devtools */
  enableDevtools: boolean
  /** 生产构建是否移除 console */
  dropConsole: boolean
  /** 是否输出 sourcemap */
  sourcemap: boolean
  /** 日志级别 */
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  /** 鉴权总开关 */
  authEnabled: boolean
  /** 默认语言 */
  defaultLocale: string
  /** i18n 回退语言 */
  fallbackLocale: string
}
