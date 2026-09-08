/** 本地存储统一 key 前缀，避免多项目同域冲突 */
export const STORAGE_PREFIX = 'cc:'

/** 本地存储 key 集中管理 */
export const STORAGE_KEYS = {
  /** 访问令牌 */
  TOKEN: `${STORAGE_PREFIX}token`,
  /** 用户资料 */
  USER: `${STORAGE_PREFIX}user`,
  /** 界面语言 */
  LOCALE: `${STORAGE_PREFIX}locale`,
  /** 主题 */
  THEME: `${STORAGE_PREFIX}theme`,
  /** 侧边栏折叠状态 */
  SIDEBAR_COLLAPSED: `${STORAGE_PREFIX}sidebar-collapsed`,
} as const

/** 请求头 */
export const AUTH_HEADER = 'Authorization'
export const TOKEN_PREFIX = 'Bearer'

/** 分页默认值 */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 常用正则 */
export const REGEXP = {
  email: /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
  /** 中国大陆手机号 */
  phone: /^1[3-9]\d{9}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
  /** 18 位身份证 */
  idCard: /^\d{17}[\dXx]$/,
  /** 纯数字 */
  number: /^\d+$/,
  /** 密码：8-20 位，含字母和数字 */
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()_+.-]{8,20}$/,
} as const

/** 支持的语言 */
export const SUPPORT_LOCALES = ['zh-CN', 'en-US'] as const
