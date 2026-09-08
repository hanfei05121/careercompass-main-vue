/** 雇主工作台模块类型 */

/** 工作台概览指标 */
export interface EmployerDashboardMetric {
  key: string
  label: string
  value: number
  /** 环比变化，正数为增长 */
  delta?: number
}

/** 近期动态项 */
export interface EmployerActivityItem {
  id: string
  title: string
  description?: string
  createdAt?: string
}
