import { STORAGE_PREFIX } from '@/constants'

interface CacheData<T> {
  /** 存储时间戳 */
  timestamp: number
  /** 过期时间（ms），0 表示永不过期 */
  expire: number
  data: T
}

/** 是否支持 localStorage（SSR / 隐私模式兜底） */
const supportsLocal = (() => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
})()

const memoryCache = new Map<string, CacheData<unknown>>()

const fullKey = (key: string) => `${STORAGE_PREFIX}${key}`

/** 统一本地缓存：JSON 序列化 + 过期时间 + 内存兜底 */
export const localCache = {
  set<T>(key: string, data: T, expire = 0): void {
    const payload: CacheData<T> = { timestamp: Date.now(), expire, data }
    if (supportsLocal) {
      try {
        localStorage.setItem(fullKey(key), JSON.stringify(payload))
        return
      } catch {
        /* 存储满时降级到内存 */
      }
    }
    memoryCache.set(key, payload)
  },

  get<T>(key: string): T | null {
    const read = (): CacheData<T> | null => {
      if (supportsLocal) {
        const raw = localStorage.getItem(fullKey(key))
        return raw ? (JSON.parse(raw) as CacheData<T>) : null
      }
      return (memoryCache.get(key) as CacheData<T>) ?? null
    }

    const payload = read()
    if (!payload) return null
    if (payload.expire > 0 && Date.now() - payload.timestamp > payload.expire) {
      localCache.remove(key)
      return null
    }
    return payload.data
  },

  remove(key: string): void {
    if (supportsLocal) localStorage.removeItem(fullKey(key))
    memoryCache.delete(key)
  },

  /** 按前缀批量清理 */
  clear(prefix = ''): void {
    if (supportsLocal) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(fullKey(prefix)))
        .forEach((k) => localStorage.removeItem(k))
    }
    memoryCache.forEach((_, k) => {
      if (k.startsWith(prefix)) memoryCache.delete(k)
    })
  },
}

/** 会话级缓存（sessionStorage） */
export const sessionCache = {
  set<T>(key: string, data: T): void {
    sessionStorage.setItem(fullKey(key), JSON.stringify(data))
  },
  get<T>(key: string): T | null {
    const raw = sessionStorage.getItem(fullKey(key))
    return raw ? (JSON.parse(raw) as T) : null
  },
  remove(key: string): void {
    sessionStorage.removeItem(fullKey(key))
  },
}
