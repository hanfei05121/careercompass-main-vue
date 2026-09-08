/** 管理后台模块类型 */

/** 后台用户管理项 */
export interface AdminUserItem {
  id: string
  email: string
  displayName?: string
  role: 'user' | 'employer' | 'admin'
  status: 'active' | 'disabled'
  createdAt?: string
}

/** 后台数据统计指标 */
export interface AdminStatItem {
  key: string
  label: string
  value: number
  /** 环比变化，正数为增长 */
  delta?: number
}
