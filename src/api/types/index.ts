/** 通用响应包装 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  success: boolean
}

/** 分页请求参数 */
export interface PageParams {
  page?: number
  pageSize?: number
  [key: string]: unknown
}

/** 分页返回结构 */
export interface PageResult<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export * from './auth'
export * from './user'
export * from './job'
export * from './application'
export * from './employer'
export * from './ai'
