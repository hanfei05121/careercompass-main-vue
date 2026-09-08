import type { ApiResponse, PageParams, PageResult } from '@/api/types'
import { appEnv } from '@/config'
import { sleep } from '@/utils/common'

/**
 * Mock 请求层：开发环境（VITE_USE_MOCK=true）替代真实接口，
 * 各模块的 *.mock.ts 提供数据源，这里负责模拟延迟与分页。
 */

/** 模拟网络延迟 */
const delay = () => sleep(200 + Math.random() * 300)

export const ok = <T>(data: T, message = 'ok'): ApiResponse<T> => ({
  code: 0,
  message,
  data,
  success: true,
})

export const fail = (message: string, code = 400): ApiResponse<null> => ({
  code,
  message,
  data: null,
  success: false,
})

/** 内存分页 */
export const paginate = <T>(list: T[], params?: PageParams): PageResult<T> => {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length,
    page,
    pageSize,
  }
}

/** 统一 mock 入口：业务模块里用 `useMock ? mockXxx() : httpXxx()` 切换 */
export const withMock = async <T>(mockFn: () => Promise<T>): Promise<T> => {
  if (!appEnv.useMock) throw new Error('Mock is disabled. Use real API instead.')
  await delay()
  return mockFn()
}
