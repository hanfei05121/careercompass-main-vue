/** 工作台模块类型 */

/** 概览卡片指标 */
export interface DashboardMetric {
  key: string
  label: string
  value: number
  /** 环比变化，正数为增长 */
  delta?: number
}

/** 动态信息项 */
export interface FeedItem {
  id: string
  title: string
  description?: string
  createdAt?: string
  /** 跳转链接（站内路径） */
  link?: string
}
