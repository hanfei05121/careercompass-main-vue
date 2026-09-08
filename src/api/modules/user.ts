import { httpGet, httpPut } from '../request'
import type { ApiResponse, UpdateProfileParams, UserListResult, UserQuery } from '../types'

/** 用户列表（管理端） */
export const apiUserList = (query?: UserQuery) => httpGet<ApiResponse<UserListResult>>('/users', query)

/** 用户详情 */
export const apiUserDetail = (uid: string) => httpGet<ApiResponse<Record<string, unknown>>>(`/users/${uid}`)

/** 更新资料 */
export const apiUpdateProfile = (uid: string, params: UpdateProfileParams) =>
  httpPut<ApiResponse<null>>(`/users/${uid}`, params)
