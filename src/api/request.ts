import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { appEnv } from '@/config'
import { AUTH_HEADER, STORAGE_KEYS, TOKEN_PREFIX } from '@/constants'
import { localCache } from '@/utils/storage'
import type { ApiResponse } from './types'

/** 扩展配置：允许单个请求跳过 token 注入与错误提示 */
interface RequestConfigExt extends AxiosRequestConfig {
  /** 不携带 token */
  withToken?: boolean
  /** 请求失败时不弹全局错误提示 */
  silent?: boolean
}

/** 统一业务错误，方便调用方 try/catch */
export class ApiError extends Error {
  code: number
  constructor(message: string, code = -1) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const instance = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: appEnv.apiTimeout,
})

// ---------------- 请求拦截 ----------------
instance.interceptors.request.use((config) => {
  const token = localCache.get<string>(STORAGE_KEYS.TOKEN)
  if (token && (config as RequestConfigExt).withToken !== false) {
    config.headers.set?.(AUTH_HEADER, `${TOKEN_PREFIX} ${token}`)
  }
  return config
})

// ---------------- 响应拦截 ----------------
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端按 { code, message, data } 包装；code === 0 视为成功
    const body = response.data as ApiResponse
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0 || body.success) return body.data as never
      const error = new ApiError(body.message || '请求失败', body.code)
      if (!(response.config as RequestConfigExt).silent) {
        ElMessage.error(error.message)
      }
      return Promise.reject(error)
    }
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const messageMap: Record<number, string> = {
      400: '请求参数错误',
      401: '登录已过期，请重新登录',
      403: '没有操作权限',
      404: '请求的资源不存在',
      500: '服务器开小差了，请稍后重试',
    }
    const message = messageMap[status] ?? error.message ?? '网络异常，请检查网络连接'

    if (status === 401) {
      localCache.remove(STORAGE_KEYS.TOKEN)
      localCache.remove(STORAGE_KEYS.USER)
      // 避免在登录页循环跳转
      if (!location.pathname.startsWith('/auth/login')) {
        location.href = `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
      }
    }

    if (!(error.config as RequestConfigExt | undefined)?.silent) {
      ElMessage.error(message)
    }
    return Promise.reject(new ApiError(message, status ?? -1))
  }
)

/** GET 请求 */
export const httpGet = <T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfigExt) =>
  instance.get<never, T>(url, { params, ...config })

/** POST 请求 */
export const httpPost = <T = unknown>(url: string, data?: unknown, config?: RequestConfigExt) =>
  instance.post<never, T>(url, data, config)

/** PUT 请求 */
export const httpPut = <T = unknown>(url: string, data?: unknown, config?: RequestConfigExt) =>
  instance.put<never, T>(url, data, config)

/** PATCH 请求 */
export const httpPatch = <T = unknown>(url: string, data?: unknown, config?: RequestConfigExt) =>
  instance.patch<never, T>(url, data, config)

/** DELETE 请求 */
export const httpDelete = <T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfigExt) =>
  instance.delete<never, T>(url, { params, ...config })

/** 文件上传（multipart/form-data） */
export const httpUpload = <T = unknown>(url: string, file: File, filename = 'file') => {
  const formData = new FormData()
  formData.append(filename, file)
  return instance.post<never, T>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
}

export default instance
