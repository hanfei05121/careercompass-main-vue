import type { UserProfile } from './auth'
import type { PageParams, PageResult } from './index'

/** 更新资料参数（uid / role 由服务端控制，不可随意改） */
export type UpdateProfileParams = Partial<Omit<UserProfile, 'uid' | 'role'>>

/** 用户查询参数 */
export interface UserQuery extends PageParams {
  keyword?: string
  role?: UserProfile['role']
}

export type UserListResult = PageResult<UserProfile>
