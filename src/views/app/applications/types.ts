/** 我的申请模块类型 */
import type { Application } from '@/api/types'

/** 列表行：申请 + 展示需要的补充字段 */
export interface ApplicationRow extends Application {
  /** 最近一次状态更新时间的可读文本 */
  updatedText?: string
}

/** 申请筛选条件 */
export interface ApplicationFilters {
  status?: Application['status']
  keyword?: string
}
